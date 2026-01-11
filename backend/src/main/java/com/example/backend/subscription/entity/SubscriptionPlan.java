package com.example.backend.subscription.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SubscriptionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long channelId;

    @Enumerated(EnumType.STRING)
    private PlanType planType;

    private int price;

    private boolean isActive;

    private LocalDateTime createdAt;

    @Builder(access = AccessLevel.PRIVATE)
    private SubscriptionPlan(Long channelId, PlanType planType, int price, boolean active) {
        this.channelId = channelId;
        this.planType = planType;
        this.price = price;
        this.isActive = active;
        this.createdAt = LocalDateTime.now();
    }

    public static SubscriptionPlan create(Long channelId, PlanType planType, int price) {
        return SubscriptionPlan.builder()
                .channelId(channelId)
                .planType(planType)
                .price(price)
                .active(true)
                .build();
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void changePrice(int price) {
        this.price = price;
    }
}
