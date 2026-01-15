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
public class OrderResponseDTO {
    private Long id;
    private String orderCode;
    private Long memberId;
    private String memberName;
    private OrderType orderType;
    private Long planId; // SUBSCRIPTION 타입일 때 구독 플랜 ID
    private Long subscriptionId; // 결제 완료 후 생성된 구독 ID
    private Long contentId; // CONTENT 타입일 때 콘텐츠 ID
    private String contentTitle; // CONTENT 타입일 때 콘텐츠 제목
    private Long originalAmount;
    private Long discountAmount;
    private OrderStatus status;
    private LocalDateTime createdAt;

    public static OrderResponseDTO from(Order order) {
        return OrderResponseDTO.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .memberId(order.getMember().getId())
                .memberName(order.getMember().getNickname())
                .orderType(order.getOrderType())
                .planId(order.getPlanId())
                .subscriptionId(order.getSubscription() != null ? order.getSubscription().getId() : null)
                .contentId(order.getContent() != null ? order.getContent().getId() : null)
                .contentTitle(order.getContent() != null ? order.getContent().getTitle() : null)
                .originalAmount(order.getOriginalAmount())
                .discountAmount(order.getDiscountAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
