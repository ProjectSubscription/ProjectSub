package com.example.backend.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrderCreateResponseDTO {
    private String orderCode;
    private Long amount;
    private String orderName;
}
