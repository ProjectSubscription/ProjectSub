package com.example.backend.coupon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CouponValidateResponse {
    private ValidationResult result;
    private String errorCode; // result가 INVALID일 때만 사용

    public static CouponValidateResponse valid() {
        return new CouponValidateResponse(ValidationResult.VALID, null);
    }

    public static CouponValidateResponse invalid(String errorCode) {
        return new CouponValidateResponse(ValidationResult.INVALID, errorCode);
    }

    public enum ValidationResult {
        VALID,
        INVALID
    }
}
