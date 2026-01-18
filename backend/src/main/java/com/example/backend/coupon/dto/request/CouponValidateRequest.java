package com.example.backend.coupon.dto.request;

import com.example.backend.coupon.entity.CouponTargetType;
import jakarta.validation.constraints.NotNull;

public record CouponValidateRequest(
        @NotNull(message = "결제 타입은 필수입니다.")
        CouponTargetType paymentType,
        
        Long targetId // planId (SUBSCRIPTION) 또는 contentId (CONTENT)
) {
}
