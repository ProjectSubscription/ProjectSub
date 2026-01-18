package com.example.backend.settlement.dto.response;

import com.example.backend.settlement.entity.Settlement;
import com.example.backend.settlement.entity.SettlementStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class SettlementResponseDTO {

    private Long id;
    private Long creatorId; // 관리자용: 크리에이터 ID
    private String creatorNickname; // 관리자용: 크리에이터 닉네임
    private String settlementPeriod;
    private Long totalSalesAmount;
    private Long platformFeeAmount;
    private Long payoutAmount;
    private SettlementStatus status;
    private LocalDateTime settledAt;
    private Integer retryCount;
    private LocalDateTime createdAt;
    private List<SettlementDetailResponseDTO> details;
    private Integer paymentCount; // 관리자용: 결제 내역 건수 (details가 null일 때 사용)

    /**
     * 일반 사용자용 정산 DTO 생성 (크리에이터 정보 없음)
     */
    public static SettlementResponseDTO from(Settlement settlement, List<SettlementDetailResponseDTO> details) {
        return SettlementResponseDTO.builder()
                .id(settlement.getId())
                .creatorId(null)
                .creatorNickname(null)
                .settlementPeriod(settlement.getSettlementPeriod())
                .totalSalesAmount(settlement.getTotalSalesAmount())
                .platformFeeAmount(settlement.getPlatformFeeAmount())
                .payoutAmount(settlement.getPayoutAmount())
                .status(settlement.getStatus())
                .settledAt(settlement.getSettledAt())
                .retryCount(settlement.getRetryCount())
                .createdAt(settlement.getCreatedAt())
                .details(details)
                .paymentCount(details != null ? details.size() : null)
                .build();
    }

    /**
     * 관리자용 정산 DTO 생성 (크리에이터 정보 포함, details는 null 가능)
     */
    public static SettlementResponseDTO fromForAdmin(Settlement settlement, List<SettlementDetailResponseDTO> details, Integer paymentCount) {
        String creatorNickname = settlement.getCreator().getMember() != null
                ? settlement.getCreator().getMember().getNickname()
                : "크리에이터 ID: " + settlement.getCreator().getId();

        return SettlementResponseDTO.builder()
                .id(settlement.getId())
                .creatorId(settlement.getCreator().getId())
                .creatorNickname(creatorNickname)
                .settlementPeriod(settlement.getSettlementPeriod())
                .totalSalesAmount(settlement.getTotalSalesAmount())
                .platformFeeAmount(settlement.getPlatformFeeAmount())
                .payoutAmount(settlement.getPayoutAmount())
                .status(settlement.getStatus())
                .settledAt(settlement.getSettledAt())
                .retryCount(settlement.getRetryCount())
                .createdAt(settlement.getCreatedAt())
                .details(details)
                .paymentCount(paymentCount != null ? paymentCount : (details != null ? details.size() : null))
                .build();
    }
}

