package com.example.backend.subscription.dto.request;

import jakarta.validation.constraints.Min;

public record SubscriptionPlanUpdateRequest(@Min(0) Integer price, Boolean isActive) {}
