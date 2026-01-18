package com.example.backend.creator.service;

import com.example.backend.channel.dto.request.ChannelCreateRequest;
import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.service.ChannelServiceImpl;
import com.example.backend.content.dto.ContentListResponseDTO;
import com.example.backend.content.service.ContentService;
import com.example.backend.creator.dto.response.CreatorMyPageResponseDTO;
import com.example.backend.creator.dto.response.CreatorResponseDTO;
import com.example.backend.creator.entity.Creator;
import com.example.backend.creator.entity.CreatorStatus;
import com.example.backend.creator.repository.CreatorRepository;
import com.example.backend.creatorapplication.dto.CreatorApplicationDTO;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import com.example.backend.subscription.dto.response.SubscriberStatisticsResponse;
import com.example.backend.subscription.entity.SubscriptionStatus;
import com.example.backend.subscription.repository.SubscriptionRepository;
import com.example.backend.subscription.service.SubscriptionStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CreatorService {

    private final CreatorRepository creatorRepository;
    private final MemberService memberService;
    private final SubscriptionStatisticsService subscriptionStatisticsService;
    private final ContentService contentService;
    private final ChannelServiceImpl channelService;
    private final SubscriptionRepository subscriptionRepository;

    // 관리자가 승인했을 때 호출
    public void createCreator(Long memberId, CreatorApplicationDTO dto) {

        log.info("크리에이터 생성 start - memberId={}", memberId);

        Member member = memberService.approveCreator(memberId);

        Creator creator = Creator.create(member);

        // 크리에이터 생성
        Creator saveCreator = creatorRepository.save(creator);

        log.info("크리에이터 생성 완료 - creatorId={}, memberId={}", saveCreator.getId(), memberId);

        ChannelCreateRequest channelCreateRequest =
                ChannelCreateRequest.create(dto.getChannelName(), dto.getChannelDescription(),
                null, dto.getCategory());

        // 채널도 같이 생성
        channelService.createChannel(saveCreator.getId(), channelCreateRequest);

        log.info("채널 생성 성공 - creatorId={}, memberId={}", saveCreator.getId(), memberId);

    }

    // 공개용 크리에이터 정보 조회
    @Transactional(readOnly = true)
    public CreatorResponseDTO getCreatorInfo(Long memberId, Long creatorId) {

        log.info("크리에이터 공개용 정보조회 - memberId={}, creatorId={}", memberId, creatorId);

        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(()->{
                    log.error("크리에이터를 찾을 수 없습니다. creatorId={}", creatorId);
                    return new BusinessException(ErrorCode.CREATOR_NOT_FOUND);
                });
        // 채널 관련
        Channel channel = channelService.getChannelByCreatorId(creatorId);

        boolean isSubscribed = subscriptionRepository.existsByMemberIdAndChannelIdAndStatus(
                memberId, channel.getId(), SubscriptionStatus.ACTIVE);

        // 구독자 통계
        SubscriberStatisticsResponse stats =
                subscriptionStatisticsService.getSubscriberStatisticsByCreatorId(creatorId);

        // 활동지표 ( 최근 5일 발행 콘텐츠 수)
        long recentContentCount =
                contentService.getRecentPublishedContentCountByCreatorId(creatorId);

        return CreatorResponseDTO.create(creator, stats, recentContentCount, channel.getTitle(), channel.getDescription(), isSubscribed);
    }

    // 크리에이터 마이페이지 조회
    @Transactional(readOnly = true)
    public CreatorMyPageResponseDTO getCreatorMyPage(Long memberId) {

        log.info("크리에이터 마이페이지 조회 - memberId={}", memberId);

        Creator creator = creatorRepository.findByMemberId(memberId)
                .orElseThrow(()->{
                    log.error("크리에이터를 찾을 수 없습니다. memberId={}", memberId);
                    return new BusinessException(ErrorCode.CREATOR_NOT_FOUND);
                });

        // 정지되었거나 탈퇴한 크리에이터라면
        if (creator.getStatus() == CreatorStatus.STOPPED) {
            throw new BusinessException(ErrorCode.CREATOR_STATUS_STOPPED);
        } else if (creator.getStatus() == CreatorStatus.DELETED) {
            throw new BusinessException(ErrorCode.CREATOR_ALREADY_DELETED);
        }

        // 총 구독자 추가 예정
        Channel channel = channelService.getChannelByCreatorId(creator.getId());
        int totalSubscribers = channel.getSubscriberCount();
        // 정산 관련 dto 추가 예정

        // 콘텐츠 관련 dto 추가 예정
        // 총 콘텐츠 수 - 콘텐츠 서비스
        long totalContentCount = contentService.getTotalContentCountByCreatorId(creator.getId());
        // 콘텐츠 총 조회수 - 콘텐츠 서비스
        long totalViewCount = contentService.getTotalViewCountByCreatorId(creator.getId());
        // 인기 콘텐츠 top 3 - 순위, 제목, 조회수, 좋아요 수 - 콘텐츠 서비스
        List<ContentListResponseDTO> featuredContents = contentService.getFeaturedContentsByChannelId(channel.getId());

        return CreatorMyPageResponseDTO.create(creator, totalContentCount, totalViewCount, totalSubscribers, featuredContents);
    }

    // 크리에이터 인지 검증
    public boolean isCreator(Long memberId) {
        return creatorRepository.existsByMemberId(memberId);
    }

    // 크리에이터 상태 변경 ( 정지 or 소프트 삭제 )
    public void changeStatus(Long memberId, CreatorStatus status) {
        Creator creator = creatorRepository.findByMemberId(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CREATOR_NOT_FOUND));
        creator.changeStatus(status);
    }
}
