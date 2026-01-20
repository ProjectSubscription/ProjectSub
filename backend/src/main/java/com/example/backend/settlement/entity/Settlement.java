package com.example.backend.settlement.entity;

import com.example.backend.creator.entity.Creator;
import com.example.backend.global.entity.CreatedAtEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "settlements")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class Settlement extends CreatedAtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 크리에이터 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private Creator creator;

    /** 정산 기간 (YYYY-MM-DD~YYYY-MM-DD 형식, 주간 정산) */
    @Column(name = "settlement_period", nullable = false, length = 21)
    private String settlementPeriod;

    /** 해당 기간 전체 매출 */
    @Column(name = "total_sales_amount", nullable = false)
    private Long totalSalesAmount;

    /** 플랫폼 수수료 (total_sales_amount × 10%) */
    @Column(name = "platform_fee_amount", nullable = false)
    private Long platformFeeAmount;

    /** 실 지급 금액 (total_sales_amount - platform_fee_amount) */
    @Column(name = "payout_amount", nullable = false)
    private Long payoutAmount;

    /** 정산 상태 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SettlementStatus status = SettlementStatus.READY;

    /** 실제로 돈이 지급된 시점 */
    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    /** 지급 재시도 횟수 */
    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 0;

    /** 마지막 재시도 시점 */
    @Column(name = "last_retry_at")
    private LocalDateTime lastRetryAt;

    public static Settlement create(
            Creator creator,
            String settlementPeriod,
            Long totalSalesAmount
    ) {
        Long platformFeeAmount = (long) (totalSalesAmount * 0.1);
        Long payoutAmount = totalSalesAmount - platformFeeAmount;

        return Settlement.builder()
                .creator(creator)
                .settlementPeriod(settlementPeriod)
                .totalSalesAmount(totalSalesAmount)
                .platformFeeAmount(platformFeeAmount)
                .payoutAmount(payoutAmount)
                .build();
    }

    public void markCompleted() {
        this.status = SettlementStatus.COMPLETED;
        this.settledAt = LocalDateTime.now();
    }

    public void markFailed() {
        this.status = SettlementStatus.FAILED;
    }

    public void markReady() {
        this.status = SettlementStatus.READY;
    }

    /**
     * 재시도 횟수 증가 및 마지막 재시도 시점 업데이트
     */
    public void incrementRetryCount() {
        this.retryCount++;
        this.lastRetryAt = LocalDateTime.now();
    }

    /**
     * 최대 재시도 횟수 초과 여부 확인
     */
    public boolean isMaxRetryExceeded(int maxRetryCount) {
        return this.retryCount >= maxRetryCount;
    }

    /**
     * 정산 금액 업데이트 (결제 추가 시 매출 금액 증가)
     * @param additionalAmount 추가되는 결제 금액
     */
    public void addSalesAmount(Long additionalAmount) {
        this.totalSalesAmount += additionalAmount;
        this.platformFeeAmount = (long) (this.totalSalesAmount * 0.1);
        this.payoutAmount = this.totalSalesAmount - this.platformFeeAmount;
    }

    /**
     * 정산 금액 차감 (결제 취소 시 매출 금액 감소)
     * @param cancelledAmount 취소되는 결제 금액
     */
    public void subtractSalesAmount(Long cancelledAmount) {
        this.totalSalesAmount = Math.max(0, this.totalSalesAmount - cancelledAmount);
        this.platformFeeAmount = (long) (this.totalSalesAmount * 0.1);
        this.payoutAmount = this.totalSalesAmount - this.platformFeeAmount;
    }
}

