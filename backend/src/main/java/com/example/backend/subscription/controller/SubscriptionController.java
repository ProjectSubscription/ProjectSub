package com.example.backend.subscription.controller;

import com.example.backend.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/channels/{channelId}/subscriptions")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    @PostMapping
    // TODO: 테스트용 임시 수정 - 인증 구현 후 @AuthenticationPrincipal로 변경 예정
    // public Long subscribe(@AuthenticationPrincipal Long memberId, @PathVariable Long channelId, @RequestParam Long planId) {
    public Long subscribe(@RequestParam(required = false) Long memberId, @PathVariable Long channelId, @RequestParam Long planId) {
        // 테스트용: memberId가 없으면 기본값 1L 사용 (실제 환경에서는 인증 필요)
        Long actualMemberId = memberId != null ? memberId : 1L;

        // return subscriptionService.subscribe(memberId, channelId, planId);
        return subscriptionService.subscribe(actualMemberId, channelId, planId);
    }
}
