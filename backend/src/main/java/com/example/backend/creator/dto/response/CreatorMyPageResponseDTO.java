package com.example.backend.creator.dto.response;

import com.example.backend.creator.entity.Creator;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class CreatorMyPageResponseDTO {

    private Long creatorId;

    // 총 구독자 - 채널 서비스
    private Long totalSubscribers;

    // 이번달 예상 수익 - 정산 서비스
    private Long expectedRevenue;

    // 총 콘텐츠 수 - 콘텐츠 서비스
    private Long totalContents;

    // 콘텐츠 총 조회수 - 콘텐츠 서비스
    private Long totalViews;

    // 최근 3개월 수익 - 월 / 수수료 / 정산상태 / 최종 수익금 - 정산 서비스
    // private List<MonthlyRevenuesDTO> monthlyRevenues;

    // 인기 콘텐츠 top 3 - 순위, 제목, 조회수, 좋아요 수 - 콘텐츠 서비스
    // private List<TopContentsDTO> topContents;

    public static CreatorMyPageResponseDTO create(Creator creator) {
        return CreatorMyPageResponseDTO.builder()
                .creatorId(creator.getId())
                // 추가 예정

                // 총 구독자

                // 정산 관련

                // 콘텐츠 관련

                .build();
    }


}
