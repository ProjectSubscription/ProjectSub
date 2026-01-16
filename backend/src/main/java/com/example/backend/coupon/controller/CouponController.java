package com.example.backend.coupon.controller;

import com.example.backend.coupon.dto.response.ChannelCouponResponse;
import com.example.backend.coupon.dto.response.CouponIssueResponse;
import com.example.backend.coupon.service.CouponIssueService;
import com.example.backend.coupon.service.CouponQueryService;
import com.example.backend.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CouponController {

    private final CouponQueryService couponQueryService;
    private final CouponIssueService couponIssueService;

    /**
     * 채널별 다운로드 가능한 쿠폰 목록 조회
     * 비회원도 조회 가능 (인증 선택적)
     * 
     * @param channelId 채널 ID
     * @param userDetails 인증된 사용자 정보 (비회원인 경우 null)
     * @return 채널별 쿠폰 목록
     */
    @GetMapping("/channels/{channelId}/coupons")
    public ResponseEntity<List<ChannelCouponResponse>> getChannelCoupons(
            @PathVariable Long channelId,
            @AuthenticationPrincipal(required = false) CustomUserDetails userDetails
    ) {
        Long memberId = userDetails != null ? userDetails.getMemberId() : null;
        List<ChannelCouponResponse> coupons = couponQueryService.getAvailableCouponsByChannel(channelId, memberId);
        return ResponseEntity.ok(coupons);
    }

    /**
     * 쿠폰 발급 (다운로드)
     * 인증된 사용자만 접근 가능
     * 
     * @param couponId 쿠폰 ID
     * @param userDetails 인증된 사용자 정보
     * @return 발급 결과
     */
    @PostMapping("/coupons/{couponId}/issue")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CouponIssueResponse> issueCoupon(
            @PathVariable Long couponId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long memberId = userDetails.getMemberId();
        Long memberCouponId = couponIssueService.issueCoupon(memberId, couponId);
        return ResponseEntity.ok(CouponIssueResponse.of(memberCouponId));
    }
}
