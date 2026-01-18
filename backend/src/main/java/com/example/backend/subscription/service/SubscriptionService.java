package com.example.backend.subscription.service;

import com.example.backend.channel.repository.ChannelRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.subscription.dto.response.SubscriptionResponse;
import com.example.backend.subscription.entity.PlanType;
import com.example.backend.subscription.entity.Subscription;
import com.example.backend.subscription.entity.SubscriptionPlan;
import com.example.backend.subscription.entity.SubscriptionStatus;
import com.example.backend.subscription.repository.SubscriptionPlanRepository;
import com.example.backend.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final ChannelRepository channelRepository;

    public Long subscribe(Long memberId, Long channelId, Long planId) {
        if(subscriptionRepository.existsByMemberIdAndChannelIdAndStatus(memberId, channelId, SubscriptionStatus.ACTIVE)) {
            throw new BusinessException(ErrorCode.DUPLICATE_ACTIVE_SUBSCRIPTION);
        }

        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId).orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));

        if(!plan.isActive()) {
            throw new BusinessException(ErrorCode.INACTIVE_SUBSCRIPTION_PLAN);
        }

        LocalDateTime startedAt = LocalDateTime.now();
        LocalDateTime expiredAt = calculateExpiredAt(startedAt, plan.getPlanType());
        Subscription subscription = Subscription.active(memberId, channelId, planId, startedAt, expiredAt);

        return subscriptionRepository.save(subscription).getId();
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getMySubscriptions(Long memberId) {
        if (memberId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        List<Subscription> subscriptions = subscriptionRepository.findByMemberIdOrderByStartedAtDesc(memberId);

        return subscriptions.stream()
                .map(subscription -> new SubscriptionResponse(
                        subscription.getId(),
                        subscription.getChannelId(),
                        subscription.getPlanId(),
                        subscription.getStatus(),
                        subscription.getStartedAt(),
                        subscription.getExpiredAt()
                ))
                .toList();
    }

    public void cancelSubscription(Long subscriptionId, Long memberId) {
        if (memberId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        Subscription subscription = subscriptionRepository.findById(subscriptionId).orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        if(!subscription.getMemberId().equals(memberId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        subscription.cancel();
        subscriptionRepository.save(subscription);
    }

    @Transactional(readOnly = true)
    public boolean hasActiveSubscription(Long memberId, Long channelId) {
        return subscriptionRepository.existsByMemberIdAndChannelIdAndStatus(
                memberId, channelId, SubscriptionStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public List<Subscription> getActiveSubscriptionsByChannelId(Long channelId) {
        return subscriptionRepository.findByChannelIdAndStatus(channelId, SubscriptionStatus.ACTIVE);
    }

    private LocalDateTime calculateExpiredAt(LocalDateTime startedAt, PlanType planType) {
        return switch (planType) {
            case MONTHLY -> startedAt.plusMonths(1);
            case YEARLY -> startedAt.plusYears(1);
        };
    }
}
