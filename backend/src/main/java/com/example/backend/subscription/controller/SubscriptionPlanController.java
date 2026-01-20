package com.example.backend.subscription.controller;

import com.example.backend.global.security.CustomUserDetails;
import com.example.backend.member.entity.Role;
import com.example.backend.subscription.dto.request.SubscriptionPlanCreateRequest;
import com.example.backend.subscription.dto.request.SubscriptionPlanUpdateRequest;
import com.example.backend.subscription.dto.response.SubscriptionPlanResponse;
import com.example.backend.subscription.service.SubscriptionPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/channels/{channelId}/plans")
public class SubscriptionPlanController {
    private final SubscriptionPlanService subscriptionPlanService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Long createPlan(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long channelId,
            @Valid @RequestBody SubscriptionPlanCreateRequest request) {
        // 크리에이터 권한 확인
        if (userDetails == null || !userDetails.getRoles().contains(Role.ROLE_CREATOR)) {
            throw new IllegalArgumentException("크리에이터 권한이 필요합니다.");
        }
        
        return subscriptionPlanService.createPlan(
                userDetails.getMemberId(),
                channelId,
                request.planType(),
                request.price()
        );
    }

    @GetMapping
    public List<SubscriptionPlanResponse> getPlans(@PathVariable Long channelId) {
        return subscriptionPlanService.getPlansByChannelId(channelId);
    }

    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public List<SubscriptionPlanResponse> getAllPlans(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long channelId) {
        // 크리에이터 권한 확인
        if (userDetails == null || !userDetails.getRoles().contains(Role.ROLE_CREATOR)) {
            throw new IllegalArgumentException("크리에이터 권한이 필요합니다.");
        }
        return subscriptionPlanService.getAllPlansByChannelId(channelId, userDetails.getMemberId());
    }

    @PutMapping("/{planId}")
    @PreAuthorize("isAuthenticated()")
    public void updatePlan(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long channelId,
            @PathVariable Long planId,
            @Valid @RequestBody SubscriptionPlanUpdateRequest request) {
        subscriptionPlanService.updatePlan(
                userDetails.getMemberId(),
                channelId,
                planId,
                request.price(),
                request.isActive()
        );
    }
}
