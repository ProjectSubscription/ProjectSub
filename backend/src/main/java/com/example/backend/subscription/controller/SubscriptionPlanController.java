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
    // TODO: 테스트용 임시 수정 - 인증 구현 후 @AuthenticationPrincipal로 변경 예정
    // public Long createPlan(@AuthenticationPrincipal Long creatorId, @PathVariable Long channelId, @Valid @RequestBody SubscriptionPlanCreateRequest request) {
    public Long createPlan(@RequestParam(required = false) Long creatorId, @PathVariable Long channelId, @Valid @RequestBody SubscriptionPlanCreateRequest request) {
        // 테스트용: creatorId가 없으면 기본값 1L 사용 (실제 환경에서는 인증 필요)
        Long actualCreatorId = creatorId != null ? creatorId : 1L;

        return subscriptionPlanService.createPlan(
                // creatorId,
                actualCreatorId,
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
