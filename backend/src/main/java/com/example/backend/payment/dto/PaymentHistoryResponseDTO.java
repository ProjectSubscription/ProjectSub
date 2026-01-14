package com.example.backend.payment.dto;

import com.example.backend.payment.entity.PaymentStatus;
import com.example.backend.payment.entity.PgProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 결제 이력 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistoryResponseDTO {
    
    private Long paymentId;
    private String paymentKey;
    private String orderCode;
    private String orderName;
    private Long amount;
    private PaymentStatus status;
    private PgProvider pgProvider;
    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
}
