package com.example.backend.order.service;

import com.example.backend.content.entity.Content;
import com.example.backend.content.repository.ContentRepository;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import com.example.backend.order.dto.OrderCreateRequestDTO;
import com.example.backend.order.dto.OrderCreateResponseDTO;
import com.example.backend.order.dto.OrderListResponseDTO;
import com.example.backend.order.dto.OrderResponseDTO;
import com.example.backend.order.entity.Order;
import com.example.backend.order.entity.OrderType;
import com.example.backend.order.repository.OrderRepository;
import com.example.backend.subscription.entity.SubscriptionPlan;
import com.example.backend.subscription.repository.SubscriptionPlanRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final MemberService memberService;
    private final ContentRepository contentRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    /**
     * 주문 생성
     * @param request 주문 생성 요청 (orderType, targetId, originalAmount, discountAmount)
     * @param userId 주문자 ID
     * @return 주문 생성 응답 (orderCode, amount, orderName)
     */
    public OrderCreateResponseDTO createOrder(OrderCreateRequestDTO request, Long userId) {
        // 회원 조회 (MemberService 사용)
        Member member = memberService.findRegisteredMemberById(userId);

        // 요청에서 받은 금액 정보 사용 (쿠폰 적용 여부는 프론트엔드에서 처리)
        Long originalAmount = request.getOriginalAmount();
        Long discountAmount = request.getDiscountAmount();
        
        // 금액 검증
        if (originalAmount == null || originalAmount <= 0) {
            throw new IllegalArgumentException("원래 가격이 올바르지 않습니다.");
        }
        
        // discountAmount가 null이면 originalAmount와 동일하게 처리 (할인 없음)
        if (discountAmount == null) {
            discountAmount = originalAmount;
        }
        
        // discountAmount 검증
        if (discountAmount <= 0) {
            throw new IllegalArgumentException("할인 적용 가격이 올바르지 않습니다.");
        }
        if (discountAmount > originalAmount) {
            throw new IllegalArgumentException("할인 적용 가격은 원래 가격보다 클 수 없습니다.");
        }

        String orderName = "";
        Content content = null;
        SubscriptionPlan subscriptionPlan = null;

        if (request.getOrderType() == OrderType.CONTENT) {
            // 콘텐츠 주문
            content = contentRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new IllegalArgumentException("콘텐츠가 존재하지 않습니다."));
            orderName = content.getTitle();
        } else if (request.getOrderType() == OrderType.SUBSCRIPTION) {
            // 구독 플랜 주문 (targetId는 SubscriptionPlan의 ID)
            subscriptionPlan = subscriptionPlanRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new IllegalArgumentException("구독 플랜이 존재하지 않습니다."));
            orderName = subscriptionPlan.getPlanType().name() + " 구독";
        } else {
            throw new IllegalArgumentException("지원하지 않는 주문 타입입니다.");
        }

        // 주문 코드 생성 (UUID 기반)
        String orderCode = generateOrderCode();

        // 주문 타입에 따라 주문 생성
        Long memberCouponId = request.getMemberCouponId();
        Order order;
        if (request.getOrderType() == OrderType.SUBSCRIPTION) {
            // SUBSCRIPTION 타입: planId 저장
            order = Order.createSubscriptionOrder(
                    orderCode,
                    member,
                    subscriptionPlan.getId(),
                    originalAmount,
                    discountAmount,
                    memberCouponId
            );
        } else {
            // CONTENT 타입: content 저장
            order = Order.createContentOrder(
                    orderCode,
                    member,
                    content,
                    originalAmount,
                    discountAmount,
                    memberCouponId
            );
        }

        orderRepository.save(order);

        return new OrderCreateResponseDTO(orderCode, discountAmount, orderName);
    }

    /**
     * 주문 코드 생성 (UUID 기반)
     */
    private String generateOrderCode() {
        return "ORDER_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    /**
     * 주문 코드로 주문 조회
     */
    public Order findByOrderCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("주문이 존재하지 않습니다."));
    }

    /**
     * 주문 상태를 PAID로 변경
     */
    public void markOrderAsPaid(String orderCode) {
        Order order = findByOrderCode(orderCode);
        order.markPaid();
        orderRepository.save(order);
    }

    /**
     * 주문 단건 조회 (주문 코드로)
     * @param orderCode 주문 코드
     * @return 주문 상세 정보
     */
    public OrderResponseDTO getOrderByOrderCode(String orderCode) {
        Order order = findByOrderCode(orderCode);
        return OrderResponseDTO.from(order);
    }

    /**
     * 주문 단건 조회 (ID로)
     * @param orderId 주문 ID
     * @return 주문 상세 정보
     */
    public OrderResponseDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문이 존재하지 않습니다."));
        return OrderResponseDTO.from(order);
    }

    /**
     * 주문명 생성 (주문 타입에 따라)
     */
    private String getOrderName(Order order) {
        if (order.getOrderType() == OrderType.CONTENT) {
            // CONTENT 타입: 콘텐츠 제목
            return order.getContent() != null ? order.getContent().getTitle() : "콘텐츠";
        } else if (order.getOrderType() == OrderType.SUBSCRIPTION) {
            // SUBSCRIPTION 타입: 구독 플랜명
            if (order.getPlanId() != null) {
                SubscriptionPlan plan = subscriptionPlanRepository.findById(order.getPlanId())
                        .orElse(null);
                if (plan != null) {
                    return plan.getPlanType().name() + " 구독";
                }
            }
            return "구독";
        }
        return "";
    }

    /**
     * 회원별 주문 목록 조회
     * @param memberId 회원 ID
     * @return 주문 목록
     */
    public List<OrderListResponseDTO> getOrdersByMemberId(Long memberId) {
        List<Order> orders = orderRepository.findByMemberIdOrderByCreatedAtDesc(memberId);
        return orders.stream()
                .map(order -> OrderListResponseDTO.from(order, getOrderName(order)))
                .collect(Collectors.toList());
    }

    /**
     * 회원별 주문 목록 조회 (페이징)
     * @param memberId 회원 ID
     * @param pageable 페이징 정보
     * @return 주문 목록 (페이징)
     */
    public Page<OrderListResponseDTO> getOrdersByMemberId(Long memberId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByMemberIdOrderByCreatedAtDesc(memberId, pageable);
        return orders.map(order -> OrderListResponseDTO.from(order, getOrderName(order)));
    }
}
