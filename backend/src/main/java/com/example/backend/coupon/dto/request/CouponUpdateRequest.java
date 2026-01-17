package com.example.backend.coupon.dto.request;

import com.example.backend.coupon.entity.CouponTargetType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public record CouponUpdateRequest(
        LocalDateTime expiredAt,
        List<CouponTargetCreateRequest> targets
) {
    public record CouponTargetCreateRequest(@NotNull CouponTargetType targetType, Long targetId) {}
}
