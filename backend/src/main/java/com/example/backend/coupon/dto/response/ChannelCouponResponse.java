package com.example.backend.coupon.dto.response;

import com.example.backend.coupon.entity.Coupon;
import com.example.backend.coupon.entity.CouponTarget;
import com.example.backend.coupon.entity.CouponTargetType;
import com.example.backend.coupon.entity.DiscountType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record ChannelCouponResponse(
        Long id,
        String code,
        DiscountType discountType,
        Integer discountValue,
        LocalDateTime expiredAt,
        List<CouponTargetInfo> targets,
        boolean isIssued
) {
    public static ChannelCouponResponse fromEntity(Coupon coupon, List<CouponTarget> targets, boolean isIssued) {
        List<CouponTargetInfo> targetInfos = targets.stream()
                .map(CouponTargetInfo::fromEntity)
                .collect(Collectors.toList());

        return new ChannelCouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getExpiredAt(),
                targetInfos,
                isIssued
        );
    }

    public record CouponTargetInfo(
            CouponTargetType targetType,
            Long targetId
    ) {
        public static CouponTargetInfo fromEntity(CouponTarget target) {
            return new CouponTargetInfo(
                    target.getTargetType(),
                    target.getTargetId()
            );
        }
    }
}
