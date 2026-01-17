package com.example.backend.coupon.controller;

import com.example.backend.coupon.dto.request.CouponValidateRequest;
import com.example.backend.coupon.dto.response.ChannelCouponResponse;
import com.example.backend.coupon.dto.response.CouponIssueResponse;
import com.example.backend.coupon.dto.response.CouponValidateResponse;
import com.example.backend.coupon.dto.response.MyCouponResponse;
import com.example.backend.coupon.service.CouponIssueService;
import com.example.backend.coupon.service.CouponQueryService;
import com.example.backend.coupon.service.CouponValidationService;
import com.example.backend.global.security.CustomUserDetails;
import jakarta.validation.Valid;
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
    private final CouponValidationService couponValidationService;

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

    @GetMapping("/coupons/me/available")
    public ResponseEntity<List<ChannelCouponResponse>> getAvailableCoupons(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long memberId = userDetails != null ? userDetails.getMemberId() : null;
        List<ChannelCouponResponse> coupons = couponQueryService.getAllAvailableCoupons(memberId);
        return ResponseEntity.ok(coupons);
    }

    @GetMapping("/coupons/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MyCouponResponse>> getMyCoupons(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long memberId = userDetails.getMemberId();
        List<MyCouponResponse> coupons = couponQueryService.getMyCoupons(memberId);
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

    @PostMapping("/coupons/{couponId}/validate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CouponValidateResponse> validateCoupon(
            @PathVariable Long couponId,
            @Valid @RequestBody CouponValidateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long memberId = userDetails.getMemberId();
        CouponValidateResponse response = couponValidationService.validateCoupon(
                memberId,
                couponId,
                request.getPaymentType(),
                request.getTargetId()
        );
        return ResponseEntity.ok(response);
    }
}
