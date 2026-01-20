package com.example.backend.subscription.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "subscription_plans",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_channel_plan_type", columnNames = {"channel_id", "plan_type"})
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SubscriptionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "channel_id", nullable = false)
    private Long channelId;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type", nullable = false)
    private PlanType planType;

    @Column(nullable = false)
    private int price;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Builder(access = AccessLevel.PRIVATE)
    private SubscriptionPlan(Long channelId, PlanType planType, int price) {
        this.channelId = channelId;
        this.planType = planType;
        this.price = price;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
    }

    public static SubscriptionPlan create(Long channelId, PlanType planType, int price) {
        return SubscriptionPlan.builder()
                .channelId(channelId)
                .planType(planType)
                .price(price)
                .build();
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void activate() {
        this.isActive = true;
    }

    public void changePrice(int price) {
        this.price = price;
    }
}
