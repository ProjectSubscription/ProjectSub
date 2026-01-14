package com.example.backend.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 결제 목록 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentListResponseDTO {
    
    private List<PaymentHistoryResponseDTO> payments;
    private Long totalCount;
}
