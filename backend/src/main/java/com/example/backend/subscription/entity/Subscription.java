package com.example.backend.subscription.entity;

import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "channel_id", nullable = false)
    private Long channelId;

    @Column(name = "plan_id", nullable = false)
    private Long planId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    @Column(nullable = false)
    private LocalDateTime expiredAt;

    @Builder(access = AccessLevel.PRIVATE)
    private Subscription(Long memberId, Long channelId, Long planId, SubscriptionStatus status, LocalDateTime startedAt, LocalDateTime expiredAt) {
        this.memberId = memberId;
        this.channelId = channelId;
        this.planId = planId;
        this.status = status;
        this.startedAt = startedAt;
        this.expiredAt = expiredAt;
    }

    public static Subscription active(Long memberId, Long channelId, Long planId, LocalDateTime startedAt, LocalDateTime expiredAt) {
        return Subscription.builder()
                .memberId(memberId)
                .channelId(channelId)
                .planId(planId)
                .status(SubscriptionStatus.ACTIVE)
                .startedAt(startedAt)
                .expiredAt(expiredAt)
                .build();
    }

    public void cancel() {
        if (this.status != SubscriptionStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.INVALID_SUBSCRIPTION_STATUS);
        }
        this.status = SubscriptionStatus.CANCELED;
    }

    public void expire() {
        if (this.status != SubscriptionStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.INVALID_SUBSCRIPTION_STATUS);
        }

        if (this.expiredAt.isAfter(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.INVALID_SUBSCRIPTION_STATUS);
        }

        this.status = SubscriptionStatus.EXPIRED;
    }
}
