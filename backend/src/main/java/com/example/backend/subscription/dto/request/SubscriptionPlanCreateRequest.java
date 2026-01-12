package com.example.backend.subscription.dto.request;

import com.example.backend.subscription.entity.PlanType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SubscriptionPlanCreateRequest(@NotNull PlanType planType, @Min(0) int price) {}