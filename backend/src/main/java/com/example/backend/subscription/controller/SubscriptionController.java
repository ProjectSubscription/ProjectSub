package com.example.backend.subscription.controller;

import com.example.backend.global.security.CustomUserDetails;
import com.example.backend.subscription.dto.response.SubscriptionResponse;
import com.example.backend.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    @PostMapping("/api/subscriptions")
    @PreAuthorize("isAuthenticated()")
    public Long subscribe(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam Long channelId,
            @RequestParam Long planId) {
        return subscriptionService.subscribe(userDetails.getMemberId(), channelId, planId);
    }

    @GetMapping("/api/subscriptions/me")
    @PreAuthorize("isAuthenticated()")
    public List<SubscriptionResponse> getMySubscriptions(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return subscriptionService.getMySubscriptions(userDetails.getMemberId());
    }

    @PostMapping("/api/subscriptions/{subscriptionId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public void cancelSubscription(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long subscriptionId) {
        subscriptionService.cancelSubscription(subscriptionId, userDetails.getMemberId());
    }
}
