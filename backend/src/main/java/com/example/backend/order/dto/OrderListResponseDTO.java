package com.example.backend.order.dto;

import com.example.backend.order.entity.Order;
import com.example.backend.order.entity.OrderStatus;
import com.example.backend.order.entity.OrderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderListResponseDTO {
    private Long id;
    private String orderCode;
    private OrderType orderType;
    private String orderName; // 콘텐츠 제목 또는 구독 플랜명
    private Long originalAmount;
    private Long discountAmount;
    private OrderStatus status;
    private LocalDateTime createdAt;

    public static OrderListResponseDTO from(Order order, String orderName) {
        return OrderListResponseDTO.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .orderType(order.getOrderType())
                .orderName(orderName)
                .originalAmount(order.getOriginalAmount())
                .discountAmount(order.getDiscountAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
