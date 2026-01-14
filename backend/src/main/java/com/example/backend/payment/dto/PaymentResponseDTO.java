package com.example.backend.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentResponseDTO {
    private String orderCode;
    private String status;
}
