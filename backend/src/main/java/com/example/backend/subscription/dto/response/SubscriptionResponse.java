package com.example.backend.subscription.dto.response;

import com.example.backend.subscription.entity.SubscriptionStatus;

import java.time.LocalDate;

public record SubscriptionResponse(
        Long subscriptionId,
        Long channelId,
        Long planId,
        SubscriptionStatus status,
        LocalDate startDate,
        LocalDate endDate
) {}
