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
    private Long contentId; // CONTENT 타입일 때 콘텐츠 ID
    private Long planId; // SUBSCRIPTION 타입일 때 구독 플랜 ID
    private Long subscriptionId; // 결제 완료 후 생성된 구독 ID
    private Long originalAmount;
    private Long discountAmount;
    private OrderStatus status;
    private LocalDateTime createdAt;

    public static OrderListResponseDTO from(Order order, String orderName) {
        // contentId는 직접 필드에서 가져오거나, content 엔티티에서 가져오기
        Long contentIdValue = order.getContentId();
        if (contentIdValue == null && order.getContent() != null) {
            try {
                contentIdValue = order.getContent().getId();
            } catch (Exception e) {
                // LAZY 로딩 실패 시 무시
            }
        }
        
        // subscriptionId는 subscription 엔티티에서 가져오기
        Long subscriptionIdValue = null;
        if (order.getSubscription() != null) {
            try {
                subscriptionIdValue = order.getSubscription().getId();
            } catch (Exception e) {
                // LAZY 로딩 실패 시 무시
            }
        }
        
        return OrderListResponseDTO.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .orderType(order.getOrderType())
                .orderName(orderName)
                .contentId(contentIdValue)
                .planId(order.getPlanId())
                .subscriptionId(subscriptionIdValue)
                .originalAmount(order.getOriginalAmount())
                .discountAmount(order.getDiscountAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
