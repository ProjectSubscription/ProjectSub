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

    @GetMapping("/channels/{channelId}/coupons")
    public ResponseEntity<List<ChannelCouponResponse>> getChannelCoupons(
            @PathVariable Long channelId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long memberId = userDetails != null ? userDetails.getMemberId() : null;
        List<ChannelCouponResponse> coupons = couponQueryService.getAvailableCouponsByChannel(channelId, memberId);
        return ResponseEntity.ok(coupons);
    }

    @GetMapping("/contents/{contentId}/coupons")
    public ResponseEntity<List<ChannelCouponResponse>> getContentCoupons(
            @PathVariable Long contentId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long memberId = userDetails != null ? userDetails.getMemberId() : null;
        List<ChannelCouponResponse> coupons = couponQueryService.getAvailableCouponsByContent(contentId, memberId);
        return ResponseEntity.ok(coupons);
    }

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
