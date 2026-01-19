package com.example.backend.creator.dto.response;

import com.example.backend.content.dto.ContentListResponseDTO;
import com.example.backend.creator.entity.Creator;
import com.example.backend.settlement.dto.response.SettlementResponseDTO;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class CreatorMyPageResponseDTO {

    private Long creatorId;

    // 총 구독자 - 채널 서비스
    private int totalSubscribers;

    // 이번달 예상 수익 - 정산 서비스
    private long thisMonthExpectedRevenue;

    // 총 콘텐츠 수 - 콘텐츠 서비스
    private long totalContentCount;

    // 콘텐츠 총 조회수 - 콘텐츠 서비스
    private long totalViewCount;

    // 최근 3개월 수익 - 월 / 수수료 / 정산상태 / 최종 수익금 - 정산 서비스
    private List<SettlementResponseDTO> recentThreeMonthsRevenue;

    // 인기 콘텐츠 top 3 - 순위, 제목, 조회수, 좋아요 수 - 콘텐츠 서비스
    private List<ContentListResponseDTO> featuredContents;

    public static CreatorMyPageResponseDTO create(Creator creator, long totalContentCount, long totalViewCount,
                                                  int totalSubscribers, List<ContentListResponseDTO> featuredContents,
                                                  long thisMonthExpectedRevenue, List<SettlementResponseDTO> recentThreeMonthsRevenue) {
        return CreatorMyPageResponseDTO.builder()
                .creatorId(creator.getId())
                // 총 구독자
                .totalSubscribers(totalSubscribers)
                // 정산 관련
                .thisMonthExpectedRevenue(thisMonthExpectedRevenue)
                .recentThreeMonthsRevenue(recentThreeMonthsRevenue)
                // 콘텐츠 관련
                .totalContentCount(totalContentCount)
                .totalViewCount(totalViewCount)
                .featuredContents(featuredContents)
                .build();
    }
}
