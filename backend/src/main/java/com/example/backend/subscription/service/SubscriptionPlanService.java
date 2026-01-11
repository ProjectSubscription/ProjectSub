package com.example.backend.subscription.service;

import com.example.backend.channel.validator.ChannelValidator;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.subscription.dto.response.SubscriptionPlanResponse;
import com.example.backend.subscription.entity.PlanType;
import com.example.backend.subscription.entity.SubscriptionPlan;
import com.example.backend.subscription.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionPlanService {
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final ChannelValidator channelValidator;

    // TODO: 구독 상품을 만들떄, channelId 뿐만 아니라 크리에이터 id도 확인? -> 채널 소유자 확인(ChannelValidator)

    @Transactional
    public Long createPlan(Long creatorId ,Long channelId, PlanType planType, int price) {

        channelValidator.validateOwner(creatorId, channelId);
        channelValidator.validateChannel(channelId);

        if(subscriptionPlanRepository.existsByChannelIdAndPlanType(channelId, planType)) {
            throw new BusinessException(ErrorCode.DUPLICATE_SUBSCRIPTION_PLAN);
        }

        SubscriptionPlan plan = SubscriptionPlan.create(channelId, planType, price);

        return subscriptionPlanRepository.save(plan).getId();
    }

    public List<SubscriptionPlanResponse> getPlansByChannelId(Long channelId) {
        return subscriptionPlanRepository.findActivePlans(channelId)
                .stream()
                .map(p -> new SubscriptionPlanResponse(p.getId(), p.getPlanType(), p.getPrice()))
                .toList();
    }
}
