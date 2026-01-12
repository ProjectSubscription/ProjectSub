package com.example.backend.subscription.controller;

import com.example.backend.subscription.dto.response.SubscriptionResponse;
import com.example.backend.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    @PostMapping("/api/channels/{channelId}/subscriptions")
    // TODO: 테스트용 임시 수정 - 인증 구현 후 @AuthenticationPrincipal로 변경 예정
    // public Long subscribe(@AuthenticationPrincipal Long memberId, @PathVariable Long channelId, @RequestParam Long planId) {
    public Long subscribe(@RequestParam(required = false) Long memberId, @PathVariable Long channelId, @RequestParam Long planId) {
        return subscriptionService.subscribe(memberId, channelId, planId);
    }

    @GetMapping("/api/subscriptions/me")
    // TODO: 테스트용 임시 수정 - 인증 구현 후 @AuthenticationPrincipal로 변경 예정
    // public List<SubscriptionResponse> getMySubscriptions(@AuthenticationPrincipal Long memberId) {
    public List<SubscriptionResponse> getMySubscriptions(@RequestParam(required = false) Long memberId) {
        return subscriptionService.getMySubscriptions(memberId);
    }
}
