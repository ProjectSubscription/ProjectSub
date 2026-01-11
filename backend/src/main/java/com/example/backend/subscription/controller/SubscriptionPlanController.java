package com.example.backend.subscription.controller;

import com.example.backend.subscription.dto.request.SubscriptionPlanCreateRequest;
import com.example.backend.subscription.dto.response.SubscriptionPlanResponse;
import com.example.backend.subscription.service.SubscriptionPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/channels/{channelId}/plans")
public class SubscriptionPlanController {
    private final SubscriptionPlanService subscriptionPlanService;

    @PostMapping
    public Long createPlan(@AuthenticationPrincipal Long creatorId,
                           @PathVariable Long channelId,
                           @Valid @RequestBody SubscriptionPlanCreateRequest request) {

        return subscriptionPlanService.createPlan(
                creatorId,
                channelId,
                request.planType(),
                request.price()
        );
    }

    @GetMapping
    public List<SubscriptionPlanResponse> getPlans(@PathVariable Long channelId) {
        return subscriptionPlanService.getPlansByChannelId(channelId);
    }
}
