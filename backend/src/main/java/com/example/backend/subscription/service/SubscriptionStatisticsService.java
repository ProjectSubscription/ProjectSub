package com.example.backend.subscription.service;

import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.repository.ChannelRepository;
import com.example.backend.channel.validator.ChannelValidator;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.subscription.dto.response.SubscriberStatisticsResponse;
import com.example.backend.subscription.entity.Subscription;
import com.example.backend.subscription.entity.SubscriptionStatus;
import com.example.backend.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionStatisticsService {
    private final ChannelRepository channelRepository;
    private final ChannelValidator channelValidator;
    private final SubscriptionRepository subscriptionRepository;
    private final MemberRepository memberRepository;

    public SubscriberStatisticsResponse getSubscriberStatisticsByCreatorId(Long creatorId) {
        Channel channel = channelRepository.findOneByCreatorId(creatorId).orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));

        channelValidator.validateOwner(creatorId, channel.getId());

        List<Subscription> subscriptions = subscriptionRepository.findByChannelIdAndStatus(channel.getId(), SubscriptionStatus.ACTIVE);

        if (subscriptions.isEmpty()) {
            return new SubscriberStatisticsResponse(0L, Map.of(), Map.of());
        }

        List<Long> memberIds = subscriptions.stream().map(Subscription::getMemberId).distinct().toList();
        List<Member> members = memberRepository.findAllById(memberIds);
        Map<String, Long> ageGroupDistribution = calculateAgeGroupDistribution(members);
        Map<String, Long> genderDistribution = calculateGenderDistribution(members);

        return new SubscriberStatisticsResponse(
                (long) subscriptions.size(),
                ageGroupDistribution,
                genderDistribution
        );
    }

    private Map<String, Long> calculateAgeGroupDistribution(List<Member> members) {
        int currentYear = LocalDate.now().getYear();
        return members.stream().filter(m -> m.getBirthYear() != null).collect(Collectors.groupingBy(
                member -> {
                    int age = currentYear - member.getBirthYear();
                    return getAgeGroup(age);
                }, Collectors.counting()
        ));
    }

    private Map<String, Long> calculateGenderDistribution(List<Member> members) {
        return members.stream()
                .filter(member -> member.getGender() != null)
                .collect(Collectors.groupingBy(
                        member -> member.getGender().name(),
                        Collectors.counting()
                ));
    }

    private String getAgeGroup(int age) {
        if (age < 10) return "10세 미만";
        if (age < 20) return "10대";
        if (age < 30) return "20대";
        if (age < 40) return "30대";
        if (age < 50) return "40대";
        if (age < 60) return "50대";
        return "60대 이상";
    }
}
