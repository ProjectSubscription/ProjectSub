package com.example.backend.subscription.dto.response;

import com.example.backend.subscription.entity.SubscriptionStatus;

import java.time.LocalDateTime;

public record SubscriptionResponse(
        Long subscriptionId,
        Long channelId,
        Long planId,
        SubscriptionStatus status,
        LocalDateTime startDate,
        LocalDateTime endDate
) {}
