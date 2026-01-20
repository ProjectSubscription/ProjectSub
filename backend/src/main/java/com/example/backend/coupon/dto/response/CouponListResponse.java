package com.example.backend.coupon.dto.response;

import com.example.backend.coupon.entity.Coupon;
import com.example.backend.coupon.entity.CouponTarget;
import com.example.backend.coupon.entity.DiscountType;
import com.example.backend.coupon.entity.RefundType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
        Long usedCount,
        List<CouponTargetInfo> targets
) {
    public static CouponListResponse fromEntity(Coupon coupon, Long issuedCount, Long usedCount, List<CouponTarget> targets) {
        LocalDateTime now = LocalDateTime.now();
        Boolean isActive = coupon.getExpiredAt().isAfter(now);
        
        List<CouponTargetInfo> targetInfos = targets != null
                ? targets.stream()
                        .map(CouponTargetInfo::fromEntity)
                        .collect(Collectors.toList())
                : List.of();
        
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
                usedCount,
                targetInfos
        );
    }

    public record CouponTargetInfo(
            com.example.backend.coupon.entity.CouponTargetType targetType,
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
