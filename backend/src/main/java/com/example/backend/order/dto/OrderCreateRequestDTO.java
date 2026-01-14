package com.example.backend.order.dto;

import com.example.backend.order.entity.OrderType;
import lombok.Getter;

@Getter
public class OrderCreateRequestDTO {
    private OrderType orderType;
    private Long targetId;
}
