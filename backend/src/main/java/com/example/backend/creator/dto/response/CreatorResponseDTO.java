package com.example.backend.creator.dto.response;

import com.example.backend.creator.entity.Creator;
import com.example.backend.subscription.dto.response.SubscriberStatisticsResponse;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class CreatorResponseDTO {

    private Long creatorId;

    // 작성자 정보
    private String nickname;
    private String introduction;

    // 상단 프로필 - 채널 서비스
    private String channelName; // 채널 관련
    private String channelDescription; // 채널 관련
    private boolean isSubscribed; // 채널관련

    // 구독자 통계 ( 나이대별 구독자 비율, 남녀 비율 )
    private SubscriberStatisticsResponse subscriberStatisticsResponse;

    // 활동 지표 ( 최근 5일간 발행 콘텐츠 수 )
    private long recentContentCount;

    public static CreatorResponseDTO create(Creator creator,
                                            SubscriberStatisticsResponse subscriberStatisticsResponse,
                                            long recentContentCount,
                                            String channelName,
                                            String channelDescription,
                                            boolean isSubscribed) {
        return CreatorResponseDTO.builder()
                .creatorId(creator.getId())
                .introduction(creator.getIntroduction())
                .nickname(creator.getMember().getNickname())
                // 채널 관련
                .channelName(channelName)
                .channelDescription(channelDescription)
                .isSubscribed(isSubscribed)
                // 구독자 통계
                .subscriberStatisticsResponse(subscriberStatisticsResponse)
                // 활동 지표
                .recentContentCount(recentContentCount)
                .build();
    }
}
