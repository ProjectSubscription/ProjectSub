package com.example.backend.subscription.dto.response;

import com.example.backend.subscription.entity.PlanType;

public record SubscriptionPlanResponse(Long planId, PlanType planType, int price) {}
