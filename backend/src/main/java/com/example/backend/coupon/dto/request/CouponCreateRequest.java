package com.example.backend.coupon.dto.request;

import com.example.backend.coupon.entity.CouponTargetType;
import com.example.backend.coupon.entity.DiscountType;
import com.example.backend.coupon.entity.RefundType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;
import java.util.List;

public record CouponCreateRequest(
        @NotNull
        DiscountType discountType,

        @NotNull
        @Positive
        Integer discountValue,

        RefundType refundType,

        @NotNull
        LocalDateTime expiredAt,

        Long channelId,

        List<CouponTargetCreateRequest> targets
) {
    public record CouponTargetCreateRequest(@NotNull CouponTargetType targetType, Long targetId) {}
}