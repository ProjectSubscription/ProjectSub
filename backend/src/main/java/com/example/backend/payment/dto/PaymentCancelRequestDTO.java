package com.example.backend.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

/**
 * 결제 취소 요청 DTO
 */
@Getter
@Setter
public class PaymentCancelRequestDTO {
    
    @NotBlank(message = "paymentKey는 필수입니다.")
    private String paymentKey;
    
    @NotBlank(message = "cancelReason은 필수입니다.")
    private String cancelReason;
    
    @NotNull(message = "cancelAmount는 필수입니다.")
    @Positive(message = "cancelAmount는 양수여야 합니다.")
    private Long cancelAmount;
}
