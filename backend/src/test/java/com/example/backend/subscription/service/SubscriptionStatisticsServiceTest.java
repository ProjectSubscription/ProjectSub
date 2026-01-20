package com.example.backend.subscription.service;

import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.entity.ChannelCategory;
import com.example.backend.channel.repository.ChannelRepository;
import com.example.backend.channel.validator.ChannelValidator;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.Role;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.subscription.dto.response.SubscriberStatisticsResponse;
import com.example.backend.subscription.entity.Subscription;
import com.example.backend.subscription.entity.SubscriptionStatus;
import com.example.backend.subscription.repository.SubscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("구독자 통계 서비스 테스트")
class SubscriptionStatisticsServiceTest {

    @Mock
    private ChannelRepository channelRepository;

    @Mock
    private ChannelValidator channelValidator;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private SubscriptionStatisticsService subscriptionStatisticsService;

    private Long creatorId;
    private Long channelId;
    private Channel channel;

    @BeforeEach
    void setUp() {
        creatorId = 1L;
        channelId = 10L;
        channel = Channel.create(creatorId, "테스트 채널", "테스트 설명", ChannelCategory.EDUCATION);
        // Reflection을 사용해서 ID 설정 (테스트용)
        try {
            Field idField = Channel.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(channel, channelId);
        } catch (Exception e) {
            // Reflection 실패 시 무시
        }
    }

    @Test
    @DisplayName("채널이 없으면 CHANNEL_NOT_FOUND 예외 발생")
    void testGetStatistics_ChannelNotFound() {
        // given
        when(channelRepository.findOneByCreatorId(creatorId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> subscriptionStatisticsService.getSubscriberStatisticsByCreatorId(creatorId))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.CHANNEL_NOT_FOUND);
    }

    @Test
    @DisplayName("활성 구독이 없으면 빈 통계 반환")
    void testGetStatistics_NoActiveSubscriptions() {
        // given
        when(channelRepository.findOneByCreatorId(creatorId)).thenReturn(Optional.of(channel));
        doNothing().when(channelValidator).validateOwner(creatorId, channelId);
        when(subscriptionRepository.findByChannelIdAndStatus(channelId, SubscriptionStatus.ACTIVE)).thenReturn(Collections.emptyList());

        // when
        SubscriberStatisticsResponse result = subscriptionStatisticsService.getSubscriberStatisticsByCreatorId(creatorId);

        // then
        assertThat(result.totalSubscribers()).isEqualTo(0L);
        assertThat(result.ageGroupDistribution()).isEmpty();
        assertThat(result.genderDistribution()).isEmpty();
    }

    @Test
    @DisplayName("활성 구독이 있고 나이대별 통계가 정상적으로 생성됨")
    void testGetStatistics_WithActiveSubscriptions() {
        // given
        Long memberId1 = 100L;
        Long memberId2 = 101L;
        Long memberId3 = 102L;

        // 구독 생성
        Subscription subscription1 = Subscription.active(memberId1, channelId, 1L, LocalDateTime.now(), LocalDateTime.now().plusMonths(1));
        Subscription subscription2 = Subscription.active(memberId2, channelId, 1L, LocalDateTime.now(), LocalDateTime.now().plusMonths(1));
        Subscription subscription3 = Subscription.active(memberId3, channelId, 1L, LocalDateTime.now(), LocalDateTime.now().plusMonths(1));
        List<Subscription> subscriptions = Arrays.asList(subscription1, subscription2, subscription3);

        // 회원 생성 (나이대별: 20대 2명, 30대 1명)
        int currentYear = LocalDate.now().getYear();
        Member member1 = createMember(memberId1, currentYear - 25); // 20대
        Member member2 = createMember(memberId2, currentYear - 28); // 20대
        Member member3 = createMember(memberId3, currentYear - 35); // 30대
        List<Member> members = Arrays.asList(member1, member2, member3);

        when(channelRepository.findOneByCreatorId(creatorId)).thenReturn(Optional.of(channel));
        doNothing().when(channelValidator).validateOwner(creatorId, channelId);
        when(subscriptionRepository.findByChannelIdAndStatus(channelId, SubscriptionStatus.ACTIVE)).thenReturn(subscriptions);
        when(memberRepository.findAllById(anyList())).thenReturn(members);

        // when
        SubscriberStatisticsResponse result = subscriptionStatisticsService.getSubscriberStatisticsByCreatorId(creatorId);

        // then
        assertThat(result.totalSubscribers()).isEqualTo(3L);
        assertThat(result.ageGroupDistribution()).containsEntry("20대", 2L);
        assertThat(result.ageGroupDistribution()).containsEntry("30대", 1L);
        assertThat(result.genderDistribution()).isEmpty();

        verify(channelValidator, times(1)).validateOwner(creatorId, channelId);
        verify(subscriptionRepository, times(1)).findByChannelIdAndStatus(channelId, SubscriptionStatus.ACTIVE);
        verify(memberRepository, times(1)).findAllById(anyList());
    }

    @Test
    @DisplayName("birthYear가 null인 회원은 통계에서 제외됨")
    void testGetStatistics_MembersWithNullBirthYear() {
        // given
        Long memberId1 = 100L;
        Long memberId2 = 101L;

        Subscription subscription1 = Subscription.active(memberId1, channelId, 1L, LocalDateTime.now(), LocalDateTime.now().plusMonths(1));
        Subscription subscription2 = Subscription.active(memberId2, channelId, 1L, LocalDateTime.now(), LocalDateTime.now().plusMonths(1));
        List<Subscription> subscriptions = Arrays.asList(subscription1, subscription2);

        int currentYear = LocalDate.now().getYear();
        Member member1 = createMember(memberId1, currentYear - 25); // 20대
        Member member2 = createMember(memberId2, null); // birthYear가 null
        List<Member> members = Arrays.asList(member1, member2);

        when(channelRepository.findOneByCreatorId(creatorId)).thenReturn(Optional.of(channel));
        doNothing().when(channelValidator).validateOwner(creatorId, channelId);
        when(subscriptionRepository.findByChannelIdAndStatus(channelId, SubscriptionStatus.ACTIVE)).thenReturn(subscriptions);
        when(memberRepository.findAllById(anyList())).thenReturn(members);

        // when
        SubscriberStatisticsResponse result = subscriptionStatisticsService.getSubscriberStatisticsByCreatorId(creatorId);

        // then
        assertThat(result.totalSubscribers()).isEqualTo(2L);
        assertThat(result.ageGroupDistribution()).containsEntry("20대", 1L);
        assertThat(result.ageGroupDistribution()).doesNotContainKey("null");
    }

    @Test
    @DisplayName("나이대별 분류가 정확하게 작동함 (10세 미만, 10대, 20대, 30대, 40대, 50대, 60대 이상)")
    void testGetStatistics_AgeGroupClassification() {
        // given
        int currentYear = LocalDate.now().getYear();
        
        List<Long> memberIds = new ArrayList<>();
        List<Member> members = new ArrayList<>();
        List<Subscription> subscriptions = new ArrayList<>();
        
        // 각 나이대별로 회원 생성
        int[] ages = {5, 15, 25, 35, 45, 55, 65};
        for (int i = 0; i < ages.length; i++) {
            Long memberId = 100L + i;
            memberIds.add(memberId);
            members.add(createMember(memberId, currentYear - ages[i]));
            subscriptions.add(Subscription.active(memberId, channelId, 1L, LocalDateTime.now(), LocalDateTime.now().plusMonths(1)));
        }

        when(channelRepository.findOneByCreatorId(creatorId)).thenReturn(Optional.of(channel));
        doNothing().when(channelValidator).validateOwner(creatorId, channelId);
        when(subscriptionRepository.findByChannelIdAndStatus(channelId, SubscriptionStatus.ACTIVE)).thenReturn(subscriptions);
        when(memberRepository.findAllById(anyList())).thenReturn(members);

        // when
        SubscriberStatisticsResponse result = subscriptionStatisticsService.getSubscriberStatisticsByCreatorId(creatorId);

        // then
        assertThat(result.totalSubscribers()).isEqualTo(7L);
        assertThat(result.ageGroupDistribution()).containsEntry("10세 미만", 1L);
        assertThat(result.ageGroupDistribution()).containsEntry("10대", 1L);
        assertThat(result.ageGroupDistribution()).containsEntry("20대", 1L);
        assertThat(result.ageGroupDistribution()).containsEntry("30대", 1L);
        assertThat(result.ageGroupDistribution()).containsEntry("40대", 1L);
        assertThat(result.ageGroupDistribution()).containsEntry("50대", 1L);
        assertThat(result.ageGroupDistribution()).containsEntry("60대 이상", 1L);
    }

    @Test
    @DisplayName("중복된 memberId가 있어도 distinct 처리됨")
    void testGetStatistics_DuplicateMemberIds() {
        // given
        Long memberId1 = 100L;
        Long memberId2 = 101L;

        // 같은 회원이 여러 구독을 가지고 있는 경우 (테스트용)
        Subscription subscription1 = Subscription.active(memberId1, channelId, 1L, LocalDateTime.now(), LocalDateTime.now().plusMonths(1));
        Subscription subscription2 = Subscription.active(memberId1, channelId, 2L, LocalDateTime.now(), LocalDateTime.now().plusMonths(1));
        Subscription subscription3 = Subscription.active(memberId2, channelId, 1L, LocalDateTime.now(), LocalDateTime.now().plusMonths(1));
        List<Subscription> subscriptions = Arrays.asList(subscription1, subscription2, subscription3);

        int currentYear = LocalDate.now().getYear();
        Member member1 = createMember(memberId1, currentYear - 25);
        Member member2 = createMember(memberId2, currentYear - 30);
        List<Member> members = Arrays.asList(member1, member2);

        when(channelRepository.findOneByCreatorId(creatorId)).thenReturn(Optional.of(channel));
        doNothing().when(channelValidator).validateOwner(creatorId, channelId);
        when(subscriptionRepository.findByChannelIdAndStatus(channelId, SubscriptionStatus.ACTIVE)).thenReturn(subscriptions);
        when(memberRepository.findAllById(anyList())).thenReturn(members);

        // when
        SubscriberStatisticsResponse result = subscriptionStatisticsService.getSubscriberStatisticsByCreatorId(creatorId);

        // then
        assertThat(result.totalSubscribers()).isEqualTo(3L); // 구독 수: 3개

        // memberId는 distinct되므로 회원 수: 2명
        verify(memberRepository, times(1)).findAllById(argThat((List<Long> list) -> list.size() == 2));
    }

    private Member createMember(Long memberId, Integer birthYear) {
        Set<Role> roles = new HashSet<>();
        roles.add(Role.ROLE_USER);

        Member member = Member.create("test" + memberId + "@example.com", "password", "nickname" + memberId, roles, birthYear, null);
        
        // Reflection을 사용해서 ID 설정
        try {
            Field idField = Member.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(member, memberId);
        } catch (Exception e) {
            // Reflection 실패 시 무시
        }
        
        return member;
    }
}
