package com.example.backend.order.service;

import com.example.backend.content.entity.Content;
import com.example.backend.content.repository.ContentRepository;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import com.example.backend.order.dto.OrderCreateRequestDTO;
import com.example.backend.order.dto.OrderCreateResponseDTO;
import com.example.backend.order.entity.Order;
import com.example.backend.order.entity.OrderType;
import com.example.backend.order.repository.OrderRepository;
import com.example.backend.subscription.entity.SubscriptionPlan;
import com.example.backend.subscription.repository.SubscriptionPlanRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

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
     * @param request 주문 생성 요청 (orderType, targetId)
     * @param userId 주문자 ID
     * @return 주문 생성 응답 (orderCode, amount, orderName)
     */
    public OrderCreateResponseDTO createOrder(OrderCreateRequestDTO request, Long userId) {
        // 회원 조회 (MemberService 사용)
        Member member = memberService.findRegisteredMemberById(userId);

        // 주문 타입에 따라 대상 조회 및 금액 계산
        Long amount = 0L;
        String orderName = "";
        Content content = null;
        SubscriptionPlan subscriptionPlan = null;

        if (request.getOrderType() == OrderType.CONTENT) {
            // 콘텐츠 주문
            content = contentRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new IllegalArgumentException("콘텐츠가 존재하지 않습니다."));
            amount = content.getPrice().longValue();
            orderName = content.getTitle();
        } else if (request.getOrderType() == OrderType.SUBSCRIPTION) {
            // 구독 플랜 주문 (targetId는 SubscriptionPlan의 ID)
            subscriptionPlan = subscriptionPlanRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new IllegalArgumentException("구독 플랜이 존재하지 않습니다."));
            amount = (long) subscriptionPlan.getPrice();
            orderName = subscriptionPlan.getPlanType().name() + " 구독";
        } else {
            throw new IllegalArgumentException("지원하지 않는 주문 타입입니다.");
        }

        // 주문 코드 생성 (UUID 기반)
        String orderCode = generateOrderCode();

        // 주문 생성 (Subscription은 null로 설정, 실제 구독은 결제 완료 후 생성)
        Order order = Order.create(
                orderCode,
                member,
                request.getOrderType(),
                null, // subscription은 결제 완료 후 생성
                content,
                amount
        );

        orderRepository.save(order);

        return new OrderCreateResponseDTO(orderCode, amount, orderName);
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
}
