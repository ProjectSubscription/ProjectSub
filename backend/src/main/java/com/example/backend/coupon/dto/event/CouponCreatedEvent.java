package com.example.backend.coupon.dto.event;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class CouponCreatedEvent {
    private Long couponId;
    private Long channelId;

    public static CouponCreatedEvent create(Long couponId, Long channelId) {
        return CouponCreatedEvent.builder()
                .couponId(couponId)
                .channelId(channelId)
                .build();
    }
}
