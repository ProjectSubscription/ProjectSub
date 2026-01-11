package com.example.backend.subscription.service;

import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.subscription.entity.PlanType;
import com.example.backend.subscription.entity.Subscription;
import com.example.backend.subscription.entity.SubscriptionPlan;
import com.example.backend.subscription.entity.SubscriptionStatus;
import com.example.backend.subscription.repository.SubscriptionPlanRepository;
import com.example.backend.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    public Long subscribe(Long memberId, Long channelId, Long planId) {
        if(subscriptionRepository.existsByMemberIdAndChannelIdAndStatus(memberId, channelId, SubscriptionStatus.ACTIVE)) {
            throw new BusinessException(ErrorCode.DUPLICATE_ACTIVE_SUBSCRIPTION);
        }

        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId).orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));

        if(!plan.isActive()) {
            throw new BusinessException(ErrorCode.INACTIVE_SUBSCRIPTION_PLAN);
        }

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = calculateEndDate(startDate, plan.getPlanType());

        Subscription subscription = Subscription.active(
                memberId,
                channelId,
                planId,
                startDate,
                endDate
        );

        return subscriptionRepository.save(subscription).getId();
    }

    private LocalDate calculateEndDate(LocalDate startDate, PlanType planType) {
        return switch (planType) {
            case MONTHLY -> startDate.plusMonths(1);
            case YEARLY -> startDate.plusYears(1);
        };
    }
}
