package com.example.backend.subscription.service;

import com.example.backend.channel.validator.ChannelValidator;
import com.example.backend.creator.entity.Creator;
import com.example.backend.creator.repository.CreatorRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.Role;
import com.example.backend.member.repository.MemberRepository;
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
    private final MemberRepository memberRepository;
    private final CreatorRepository creatorRepository;

    @Transactional
    public Long createPlan(Long memberId, Long channelId, PlanType planType, int price) {
        // memberId를 creatorId로 변환
        Creator creator = creatorRepository.findByMemberId(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CREATOR_NOT_FOUND));
        Long creatorId = creator.getId();

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
                .map(p -> new SubscriptionPlanResponse(p.getId(), p.getPlanType(), p.getPrice(), p.isActive()))
                .toList();
    }

    public List<SubscriptionPlanResponse> getAllPlansByChannelId(Long channelId, Long memberId) {
        // 크리에이터 권한 확인
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        
        if (!member.hasRole(Role.ROLE_ADMIN)) {
            if (!member.hasRole(Role.ROLE_CREATOR)) {
                throw new BusinessException(ErrorCode.ACCESS_DENIED);
            }
            
            Creator creator = creatorRepository.findByMemberId(memberId).orElseThrow(() -> new BusinessException(ErrorCode.CREATOR_NOT_FOUND));
            channelValidator.validateOwner(creator.getId(), channelId);
        }
        
        return subscriptionPlanRepository.findAllPlans(channelId)
                .stream()
                .map(p -> new SubscriptionPlanResponse(p.getId(), p.getPlanType(), p.getPrice(), p.isActive()))
                .toList();
    }

    @Transactional
    public void updatePlan(Long memberId, Long channelId, Long planId, Integer price, Boolean isActive) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId).orElseThrow(() -> new BusinessException(ErrorCode.SUBSCRIPTION_PLAN_NOT_FOUND));

        channelValidator.validateChannel(channelId);

        if (!plan.getChannelId().equals(channelId)) {
            throw new BusinessException(ErrorCode.SUBSCRIPTION_PLAN_CHANNEL_MISMATCH);
        }

        Member member = memberRepository.findById(memberId).orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        if (!member.hasRole(Role.ROLE_ADMIN)) {
            if (!member.hasRole(Role.ROLE_CREATOR)) {
                throw new BusinessException(ErrorCode.ACCESS_DENIED);
            }

            Creator creator = creatorRepository.findByMemberId(memberId).orElseThrow(() -> new BusinessException(ErrorCode.CREATOR_NOT_FOUND));

            channelValidator.validateOwner(creator.getId(), channelId);
        }

        if (price != null) {
            plan.changePrice(price);
        }

        if (isActive != null) {
            if (isActive) {
                plan.activate();
            } else {
                plan.deactivate();
            }
        }
    }
}
