package com.example.backend.coupon.dto.response;

public record CouponIssueResponse(
        Long memberCouponId,
        String message
) {
    public static CouponIssueResponse of(Long memberCouponId) {
        return new CouponIssueResponse(memberCouponId, "쿠폰이 성공적으로 발급되었습니다.");
    }
}
