package com.example.backend.payment.controller;

import com.example.backend.payment.dto.*;
import com.example.backend.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 결제 컨트롤러
 * 토스 페이먼츠 결제 API
 */
@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * 결제 승인
     * POST /api/payments/confirm
     * 토스 페이먼츠 결제 승인 API
     * 프론트엔드에서 결제위젯을 통해 결제 완료 후, successUrl로 리다이렉트된 시점에 호출됨
     */
    @PostMapping("/confirm")
    public ResponseEntity<PaymentResponseDTO> confirmPayment(
            @Valid @RequestBody PaymentConfirmRequestDTO request
    ) {
        PaymentResponseDTO response = paymentService.confirmPayment(request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * CANCELLED 처리: 결제 취소
     * PUT /api/payments/{paymentKey}/cancel
     */
    @PutMapping("/{paymentKey}/cancel")
    public ResponseEntity<PaymentResponseDTO> cancelPayment(
            @PathVariable String paymentKey,
            @Valid @RequestBody PaymentCancelRequestDTO request
    ) {
        // paymentKey를 path variable과 request body 모두에서 받을 수 있도록 처리
        if (request.getPaymentKey() == null || request.getPaymentKey().isEmpty()) {
            request.setPaymentKey(paymentKey);
        } else if (!request.getPaymentKey().equals(paymentKey)) {
            throw new IllegalArgumentException("URL의 paymentKey와 요청 본문의 paymentKey가 일치하지 않습니다.");
        }
        
        PaymentResponseDTO response = paymentService.cancelPayment(request);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * 사용자 결제 이력 조회
     * GET /api/payments/history?memberId={memberId}&page={page}&size={size}
     */
    @GetMapping("/history")
    public ResponseEntity<PaymentListResponseDTO> getPaymentHistory(
            @RequestParam Long memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PaymentListResponseDTO response = paymentService.getPaymentHistoryByMemberId(memberId, pageable);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
