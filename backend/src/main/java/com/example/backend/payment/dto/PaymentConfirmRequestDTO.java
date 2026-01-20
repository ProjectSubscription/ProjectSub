package com.example.backend.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

/**
 * 결제 승인 요청 DTO
 */
@Getter
@Setter
public class PaymentConfirmRequestDTO {
    @NotBlank(message = "paymentKey는 필수입니다.")
    @JsonProperty("paymentKey")
    private String paymentKey;
    
    @NotBlank(message = "orderId는 필수입니다.")
    @JsonProperty("orderId")
    private String orderId;
    
    @NotNull(message = "amount는 필수입니다.")
    @Positive(message = "amount는 양수여야 합니다.")
    @JsonProperty("amount")
    private Long amount;
}
