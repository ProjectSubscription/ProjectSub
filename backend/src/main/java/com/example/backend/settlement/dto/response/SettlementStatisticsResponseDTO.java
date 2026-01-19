package com.example.backend.settlement.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class SettlementStatisticsResponseDTO {

    private Long totalSettlementAmount; // 전체 정산 금액
    private Long thisMonthSettlementAmount; // 이번 달 정산 금액
    private Long readyCount; // 대기중 건수
    private Long completedCount; // 완료 건수
    private Long failedCount; // 실패 건수
    private Long retryNeededCount; // 재시도 필요 건수

    public static SettlementStatisticsResponseDTO create(
            Long totalSettlementAmount,
            Long thisMonthSettlementAmount,
            Long readyCount,
            Long completedCount,
            Long failedCount,
            Long retryNeededCount
    ) {
        return SettlementStatisticsResponseDTO.builder()
                .totalSettlementAmount(totalSettlementAmount)
                .thisMonthSettlementAmount(thisMonthSettlementAmount)
                .readyCount(readyCount)
                .completedCount(completedCount)
                .failedCount(failedCount)
                .retryNeededCount(retryNeededCount)
                .build();
    }
}

