package com.example.backend.settlement.dto.response;

import com.example.backend.settlement.entity.SettlementDetail;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class SettlementDetailResponseDTO {

    private Long id;
    private Long paymentId;
    private String paymentKey;
    private Long amount;
    private LocalDateTime paymentApprovedAt;
    private LocalDateTime createdAt;

    public static SettlementDetailResponseDTO from(SettlementDetail settlementDetail) {
        return SettlementDetailResponseDTO.builder()
                .id(settlementDetail.getId())
                .paymentId(settlementDetail.getPayment().getId())
                .paymentKey(settlementDetail.getPayment().getPaymentKey())
                .amount(settlementDetail.getAmount())
                .paymentApprovedAt(settlementDetail.getPayment().getApprovedAt())
                .createdAt(settlementDetail.getCreatedAt())
                .build();
    }
}

