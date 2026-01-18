package com.example.backend.coupon.dto.response;

import com.example.backend.coupon.entity.Coupon;
import com.example.backend.coupon.entity.DiscountType;
import com.example.backend.coupon.entity.RefundType;

import java.time.LocalDateTime;

public record CouponListResponse(
        Long id,
        String code,
        DiscountType discountType,
        Integer discountValue,
        RefundType refundType,
        LocalDateTime expiredAt,
        Long channelId,
        Boolean isActive,
        Long issuedCount,
        Long usedCount
) {
    public static CouponListResponse fromEntity(Coupon coupon, Long issuedCount, Long usedCount) {
        LocalDateTime now = LocalDateTime.now();
        Boolean isActive = coupon.getExpiredAt().isAfter(now);
        
        return new CouponListResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getRefundType(),
                coupon.getExpiredAt(),
                coupon.getChannelId(),
                isActive,
                issuedCount,
                usedCount
        );
    }
}
