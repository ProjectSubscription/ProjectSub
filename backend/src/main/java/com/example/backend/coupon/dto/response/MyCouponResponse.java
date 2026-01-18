package com.example.backend.coupon.dto.response;

import com.example.backend.coupon.entity.Coupon;
import com.example.backend.coupon.entity.CouponTarget;
import com.example.backend.coupon.entity.MemberCoupon;
import com.example.backend.coupon.entity.MemberCouponUse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record MyCouponResponse(
        Long id,
        String code,
        String discountType,
        Integer discountValue,
        LocalDateTime expiredAt,
        LocalDateTime usedAt,
        List<CouponTargetInfo> targets
) {
    public static MyCouponResponse fromEntity(
            MemberCoupon memberCoupon,
            Coupon coupon,
            List<CouponTarget> targets,
            MemberCouponUse memberCouponUse
    ) {
        List<CouponTargetInfo> targetInfos = targets.stream()
                .map(CouponTargetInfo::fromEntity)
                .collect(Collectors.toList());

        LocalDateTime usedAt = memberCouponUse != null && memberCouponUse.getUsedAt() != null
                ? memberCouponUse.getUsedAt()
                : null;

        return new MyCouponResponse(
                memberCoupon.getId(),
                coupon.getCode(),
                coupon.getDiscountType().name(),
                coupon.getDiscountValue(),
                coupon.getExpiredAt(),
                usedAt,
                targetInfos
        );
    }

    public record CouponTargetInfo(
            String targetType,
            Long targetId
    ) {
        public static CouponTargetInfo fromEntity(CouponTarget target) {
            return new CouponTargetInfo(
                    target.getTargetType().name(),
                    target.getTargetId()
            );
        }
    }
}
