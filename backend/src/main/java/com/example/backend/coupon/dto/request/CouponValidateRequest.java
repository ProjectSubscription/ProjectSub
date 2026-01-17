package com.example.backend.coupon.dto.request;

import com.example.backend.coupon.entity.CouponTargetType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidateRequest {

    @NotNull(message = "결제 타입은 필수입니다.")
    private CouponTargetType paymentType;

    private Long targetId; // planId (SUBSCRIPTION) 또는 contentId (CONTENT)
}
