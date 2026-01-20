package com.example.backend.payment.service;

import com.example.backend.coupon.service.CouponUseService;
import com.example.backend.order.entity.Order;
import com.example.backend.order.entity.OrderStatus;
import com.example.backend.order.service.OrderService;
import com.example.backend.payment.client.TossPaymentClient;
import com.example.backend.payment.dto.*;
import com.example.backend.payment.entity.Payment;
import com.example.backend.payment.entity.PaymentStatus;
import com.example.backend.payment.entity.PgProvider;
import com.example.backend.payment.repository.PaymentRepository;
import com.example.backend.settlement.service.SettlementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 결제 서비스
 * 토스 페이먼츠 v2 API를 통한 결제 처리
 * 
 * 참고: 토스 페이먼츠 v2에서는 결제위젯을 프론트엔드에서 직접 렌더링합니다.
 * 백엔드는 결제 승인만 처리합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final TossPaymentClient tossPaymentClient;
    private final OrderService orderService;
    private final PaymentRepository paymentRepository;
    private final SettlementService settlementService;
    private final CouponUseService couponUseService;

    /**
     * 결제 승인 처리
     * 토스 페이먼츠 v2 결제 승인 API를 호출하여 결제를 완료
     */
    public PaymentResponseDTO confirmPayment(PaymentConfirmRequestDTO request) {
        // 주문 조회
        Order order = orderService.findByOrderCode(request.getOrderId());

        // 주문 금액 확인 (discountAmount가 있으면 사용, 없으면 originalAmount 사용)
        Long orderAmount = order.getDiscountAmount() != null ? order.getDiscountAmount() : order.getOriginalAmount();

        // 주문 금액 검증
        if (!orderAmount.equals(request.getAmount())) {
            throw new IllegalArgumentException("주문 금액이 일치하지 않습니다.");
        }

        // 이미 결제된 주문인지 확인
        if (order.getStatus() == OrderStatus.PAID) {
            throw new IllegalArgumentException("이미 결제된 주문입니다.");
        }

        // 토스 페이먼츠 결제 승인 요청
        TossPaymentConfirmRequestDTO tossRequest = new TossPaymentConfirmRequestDTO();
        tossRequest.setPaymentKey(request.getPaymentKey());
        tossRequest.setOrderId(request.getOrderId());
        tossRequest.setAmount(request.getAmount());

        TossPaymentConfirmResponseDTO tossResponse;
        try {
            tossResponse = tossPaymentClient.confirmPayment(tossRequest);
        } catch (Exception e) {
            // FAILED 처리: 결제 승인 중 예외가 발생하면 즉시 FAILED로 저장
            saveFailedPaymentIfNotExists(order, request.getPaymentKey(), request.getAmount());
            throw (e instanceof RuntimeException) ? (RuntimeException) e : new RuntimeException("결제 승인 요청에 실패했습니다.", e);
        }

        // 결제 상태 확인
        if (!"DONE".equals(tossResponse.getStatus())) {
            // 결제 실패 처리 (order의 discountAmount 사용, 없으면 originalAmount 사용)
            Long paymentAmount = order.getDiscountAmount() != null ? order.getDiscountAmount() : order.getOriginalAmount();
            Payment payment = Payment.create(
                    order,
                    PgProvider.TOSS,
                    tossResponse.getPaymentKey(),
                    paymentAmount
            );
            payment.markFailed();
            paymentRepository.save(payment);

            throw new RuntimeException("결제 승인에 실패했습니다. 상태: " + tossResponse.getStatus());
        }

        // 결제 정보 저장 (order의 discountAmount 사용, 없으면 originalAmount 사용)
        Long paymentAmount = order.getDiscountAmount() != null ? order.getDiscountAmount() : order.getOriginalAmount();
        Payment payment = Payment.create(
                order,
                PgProvider.TOSS,
                tossResponse.getPaymentKey(),
                paymentAmount
        );
        payment.markPaid();
        paymentRepository.save(payment);

        // 주문 상태를 PAID로 변경
        orderService.markOrderAsPaid(order.getOrderCode());

        // 쿠폰 사용 처리
        try {
            couponUseService.useCoupon(order, payment);
        } catch (Exception e) {
            // 쿠폰 사용 처리 실패해도 결제는 성공 처리 (로깅만 하고 예외는 전파하지 않음)
            log.error("결제 완료 후 쿠폰 사용 처리 중 오류 발생 - orderCode={}, paymentId={}, error: {}", 
                    order.getOrderCode(), payment.getId(), e.getMessage(), e);
        }

        // 정산 내역 생성 또는 업데이트
        try {
            settlementService.processSettlementForPayment(payment);
        } catch (Exception e) {
            // 정산 처리 실패해도 결제는 성공 처리 (로깅만 하고 예외는 전파하지 않음)
            log.error("결제 완료 후 정산 처리 중 오류 발생 - paymentId: {}, error: {}", 
                    payment.getId(), e.getMessage(), e);
        }

        log.info("결제 승인 완료: orderCode={}, paymentKey={}, amount={}",
                order.getOrderCode(), payment.getPaymentKey(), payment.getAmount());

        return new PaymentResponseDTO(order.getOrderCode(), "PAID");
    }

    /**
     * CANCELLED 처리: 결제 취소
     */
    public PaymentResponseDTO cancelPayment(PaymentCancelRequestDTO request) {
        log.info("결제 취소 요청: paymentKey={}, cancelReason={}, cancelAmount={}",
                request.getPaymentKey(), request.getCancelReason(), request.getCancelAmount());

        // 결제 조회
        Payment payment = paymentRepository.findByPaymentKey(request.getPaymentKey())
                .orElseThrow(() -> new IllegalArgumentException("결제를 찾을 수 없습니다."));

        // 이미 취소된 결제인지 확인
        if (payment.getStatus() == PaymentStatus.CANCELLED) {
            throw new IllegalArgumentException("이미 취소된 결제입니다.");
        }

        // 결제 상태가 PAID인지 확인
        if (payment.getStatus() != PaymentStatus.PAID) {
            throw new IllegalArgumentException("취소할 수 없는 결제 상태입니다. 현재 상태: " + payment.getStatus());
        }

        // 취소 금액 검증
        if (!payment.getAmount().equals(request.getCancelAmount())) {
            throw new IllegalArgumentException("취소 금액이 결제 금액과 일치하지 않습니다.");
        }

        // TODO: 토스 페이먼츠 취소 API 호출 (필요한 경우)
        // 현재는 DB 상태만 변경
        payment.markCancelled();
        paymentRepository.save(payment);

        // 주문 상태도 취소로 변경 (필요한 경우)
        Order order = payment.getOrder();
        // Order 엔티티에 취소 상태가 있다면 추가 필요

        log.info("결제 취소 완료: paymentKey={}, orderCode={}",
                payment.getPaymentKey(), order.getOrderCode());

        return new PaymentResponseDTO(order.getOrderCode(), "CANCELLED");
    }

    /**
     * 결제 승인 과정에서 예외 발생 시 FAILED로 저장 (paymentKey 중복 저장 방지)
     */
    private void saveFailedPaymentIfNotExists(Order order, String paymentKey, Long amount) {
        if (paymentKey == null || paymentKey.isBlank()) {
            log.warn("결제 실패 저장 스킵: paymentKey가 비어있습니다. orderCode={}", order.getOrderCode());
            return;
        }

        if (paymentRepository.findByPaymentKey(paymentKey).isPresent()) {
            log.warn("결제 실패 저장 스킵: 이미 동일 paymentKey로 결제가 존재합니다. paymentKey={}, orderCode={}", paymentKey, order.getOrderCode());
            return;
        }

        // order의 discountAmount 사용, 없으면 originalAmount 사용
        Long paymentAmount = order.getDiscountAmount() != null ? order.getDiscountAmount() : order.getOriginalAmount();
        Payment failedPayment = Payment.create(order, PgProvider.TOSS, paymentKey, paymentAmount);
        failedPayment.markFailed();
        paymentRepository.save(failedPayment);
        log.info("결제 실패 저장 완료: paymentKey={}, orderCode={}", paymentKey, order.getOrderCode());
    }

    /**
     * 사용자 결제 이력 조회
     */
    public PaymentListResponseDTO getPaymentHistoryByMemberId(Long memberId, Pageable pageable) {
        Page<Payment> paymentPage = paymentRepository.findByMemberId(memberId, pageable);
        Long totalCount = paymentRepository.countByMemberId(memberId);

        List<PaymentHistoryResponseDTO> paymentHistories = paymentPage.getContent().stream()
                .map(this::convertToHistoryDTO)
                .collect(Collectors.toList());

        return PaymentListResponseDTO.builder()
                .payments(paymentHistories)
                .totalCount(totalCount)
                .build();
    }

    /**
     * 특정 기간 내 PAID 상태인 결제 내역 조회 (정산용)
     * @param status 결제 상태
     * @param startDateTime 시작 일시
     * @param endDateTime 종료 일시
     * @return 결제 내역 목록
     */
    @Transactional(readOnly = true)
    public List<Payment> findPaidPaymentsInPeriod(
            PaymentStatus status,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    ) {
        return paymentRepository.findPaidPaymentsInPeriod(status, startDateTime, endDateTime);
    }

    /**
     * Payment 엔티티를 PaymentHistoryResponseDTO로 변환
     */
    private PaymentHistoryResponseDTO convertToHistoryDTO(Payment payment) {
        Order order = payment.getOrder();
        String orderName = "";
        
        if (order.getOrderType() == com.example.backend.order.entity.OrderType.CONTENT && order.getContent() != null) {
            orderName = order.getContent().getTitle();
        } else if (order.getOrderType() == com.example.backend.order.entity.OrderType.SUBSCRIPTION) {
            // Subscription의 경우 planId를 통해 구독 정보를 가져올 수 있지만,
            // 간단하게 "구독"으로 표시
            if (order.getSubscription() != null) {
                orderName = "구독";
            } else {
                orderName = "구독";
            }
        }

        return PaymentHistoryResponseDTO.builder()
                .paymentId(payment.getId())
                .paymentKey(payment.getPaymentKey())
                .orderCode(order.getOrderCode())
                .orderName(orderName)
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .pgProvider(payment.getPgProvider())
                .requestedAt(payment.getRequestedAt())
                .approvedAt(payment.getApprovedAt())
                .build();
    }

    /**
     * 주문 ID로 결제 취소
     * @param orderId 주문 ID
     */
    public void cancelPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("결제를 찾을 수 없습니다."));

        PaymentCancelRequestDTO cancelRequest = new PaymentCancelRequestDTO();
        cancelRequest.setPaymentKey(payment.getPaymentKey());
        cancelRequest.setCancelReason("구독 취소");
        cancelRequest.setCancelAmount(payment.getAmount());
        
        cancelPayment(cancelRequest);
    }
}
