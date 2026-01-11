package com.example.backend.subscription.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "subscriptions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long memberId;
    private Long channelId;
    private Long planId;

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status;

    private LocalDate startDate;
    private LocalDate endDate;

    @Builder(access = AccessLevel.PRIVATE)
    private Subscription(Long memberId, Long channelId, Long planId, SubscriptionStatus status, LocalDate startDate, LocalDate endDate) {
        this.memberId = memberId;
        this.channelId = channelId;
        this.planId = planId;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public static Subscription active(Long memberId, Long channelId, Long planId, LocalDate startDate, LocalDate endDate) {
        return Subscription.builder()
                .memberId(memberId)
                .channelId(channelId)
                .planId(planId)
                .status(SubscriptionStatus.ACTIVE)
                .startDate(startDate)
                .endDate(endDate)
                .build();
    }

    public void cancel() {
        if (this.status != SubscriptionStatus.ACTIVE) {
            throw new IllegalStateException("활성된 구독(ACTIVE)만 취소 처리 가능합니다.");
        }
        this.status = SubscriptionStatus.CANCELED;
    }

    public void expire() {
        if (this.status != SubscriptionStatus.ACTIVE) {
            throw new IllegalStateException("활성된 구독(ACTIVE)만 만료 처리 가능합니다.");
        }
        this.status = SubscriptionStatus.EXPIRED;
    }
}
