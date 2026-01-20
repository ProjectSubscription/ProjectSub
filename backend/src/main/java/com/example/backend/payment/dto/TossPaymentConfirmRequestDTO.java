package com.example.backend.payment.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TossPaymentConfirmRequestDTO {
    private String paymentKey;
    private String orderId;
    private Long amount;
}
