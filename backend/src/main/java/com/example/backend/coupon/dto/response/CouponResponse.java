package com.example.backend.coupon.dto.response;

import com.example.backend.coupon.entity.Coupon;
import com.example.backend.coupon.entity.DiscountType;
import com.example.backend.coupon.entity.RefundType;

import java.time.LocalDateTime;

public record CouponResponse(Long id,
                             String code,
                             DiscountType discountType,
                             Integer discountValue,
                             RefundType refundType,
                             LocalDateTime expiredAt,
                             Long channelId
) {
    public static CouponResponse fromEntity(Coupon coupon) {
        return new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getRefundType(),
                coupon.getExpiredAt(),
                coupon.getChannelId()
        );
    }
}