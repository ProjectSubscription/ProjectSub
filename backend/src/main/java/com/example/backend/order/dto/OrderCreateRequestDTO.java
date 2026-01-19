package com.example.backend.order.dto;

import com.example.backend.order.entity.OrderType;
import lombok.Getter;

@Getter
public class OrderCreateRequestDTO {
    private OrderType orderType;
    private Long targetId;
    private Long originalAmount; // 원래 가격
    private Long discountAmount; // 할인 적용 후 가격 (쿠폰 미적용 시 originalAmount와 동일)
    private Long memberCouponId; // 사용할 쿠폰의 MemberCoupon ID (쿠폰 미적용 시 null)
}
