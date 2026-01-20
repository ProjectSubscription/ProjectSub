package com.example.backend.settlement.service;

import com.example.backend.creator.entity.Creator;
import com.example.backend.creator.repository.CreatorRepository;
import com.example.backend.settlement.entity.Settlement;
import com.example.backend.settlement.entity.SettlementStatus;
import com.example.backend.settlement.repository.SettlementRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementPayoutService {

    private final SettlementRepository settlementRepository;
    private final CreatorRepository creatorRepository;
    private final EntityManager entityManager;

    @Value("${settlement.payout.max-retry-count:3}")
    private int maxRetryCount;

    @Value("${settlement.payout.retry-delay-minutes:30}")
    private int retryDelayMinutes;

    // 관리자 수동 재시도를 위한 setter
    public void setMaxRetryCount(int maxRetryCount) {
        this.maxRetryCount = maxRetryCount;
    }

    public void setRetryDelayMinutes(int retryDelayMinutes) {
        this.retryDelayMinutes = retryDelayMinutes;
    }

    /**
     * 정산금 지급 처리
     * @param settlement 정산 정보
     * @param creator 크리에이터 정보
     * @return 지급 성공 여부
     */
    @Transactional
    public boolean processPayout(Settlement settlement, Creator creator) {
        try {
            // Settlement 상태를 COMPLETED로 변경
            settlement.markCompleted();
            settlementRepository.save(settlement);
            entityManager.flush(); // 변경사항을 즉시 DB에 반영
            
            // 크리에이터 정보 조회
            String creatorName = creator.getMember() != null 
                    ? creator.getMember().getNickname() 
                    : "크리에이터 ID: " + creator.getId();
            
            // 계좌 지급 완료 콘솔 출력
            System.out.println("==========================================");
            System.out.println("정산금 지급 완료");
            System.out.println("==========================================");
            System.out.println("크리에이터: " + creatorName);
            System.out.println("크리에이터 ID: " + creator.getId());
            System.out.println("정산 기간: " + settlement.getSettlementPeriod());
            System.out.println("총 매출: " + String.format("%,d", settlement.getTotalSalesAmount()) + "원");
            System.out.println("플랫폼 수수료: " + String.format("%,d", settlement.getPlatformFeeAmount()) + "원");
            System.out.println("지급 금액: " + String.format("%,d", settlement.getPayoutAmount()) + "원");
            System.out.println("지급 일시: " + settlement.getSettledAt());
            System.out.println("정산 상태: " + settlement.getStatus());
            System.out.println("재시도 횟수: " + settlement.getRetryCount());
            System.out.println("==========================================");
            
            log.info("크리에이터 ID {}의 정산금 지급 완료: {}원 (재시도 횟수: {})", 
                    creator.getId(), settlement.getPayoutAmount(), settlement.getRetryCount());
            
            return true;
        } catch (Exception e) {
            log.error("정산금 지급 처리 중 오류 발생 - Settlement ID: {}, Creator ID: {}, 재시도 횟수: {}", 
                    settlement.getId(), creator.getId(), settlement.getRetryCount(), e);
            
            // 재시도 횟수 증가
            settlement.incrementRetryCount();
            
            // 실패 시 즉시 FAILED 상태로 변경 (재시도 스케줄러에서 처리)
            // 최대 재시도 횟수 초과 시 영구 실패 처리
            if (settlement.isMaxRetryExceeded(maxRetryCount)) {
                log.error("최대 재시도 횟수 초과 - Settlement ID: {}, Creator ID: {}", 
                        settlement.getId(), creator.getId());
                settlement.markFailed();
            } else {
                // 재시도 가능한 경우 FAILED 상태로 변경하여 재시도 스케줄러에서 처리
                settlement.markFailed();
            }
            
            settlementRepository.save(settlement);
            entityManager.flush(); // 변경사항을 즉시 DB에 반영
            return false;
        }
    }

    /**
     * 재시도 대상 정산 조회 및 재시도 처리
     */
    @Transactional
    public void retryFailedSettlements() {
        log.info("지급 실패 정산 재시도 배치 시작");
        
        // 재시도 가능한 시점 계산 (마지막 재시도 후 일정 시간 경과)
        LocalDateTime retryAfter = LocalDateTime.now().minusMinutes(retryDelayMinutes);
        
        // 재시도 대상 정산 조회
        List<Settlement> retryableSettlements = settlementRepository.findRetryableSettlements(
                SettlementStatus.FAILED,
                maxRetryCount,
                retryAfter
        );
        
        if (retryableSettlements.isEmpty()) {
            log.info("재시도 대상 정산이 없습니다.");
            return;
        }
        
        log.info("재시도 대상 정산 수: {}", retryableSettlements.size());
        
        int successCount = 0;
        int failCount = 0;
        
        for (Settlement settlement : retryableSettlements) {
            try {
                // 크리에이터 정보 조회
                Creator creator = creatorRepository.findById(settlement.getCreator().getId())
                        .orElseThrow(() -> new RuntimeException("Creator를 찾을 수 없습니다: " + settlement.getCreator().getId()));
                
                log.info("정산 재시도 시작 - Settlement ID: {}, Creator ID: {}, 재시도 횟수: {}/{}", 
                        settlement.getId(), creator.getId(), settlement.getRetryCount() + 1, maxRetryCount);
                
                // 재시도 전 상태를 READY로 변경 (processPayout에서 처리 가능하도록)
                if (settlement.getStatus() == SettlementStatus.FAILED) {
                    settlement.markReady();
                }
                
                // 지급 재시도
                boolean success = processPayout(settlement, creator);
                
                if (success) {
                    successCount++;
                    log.info("정산 재시도 성공 - Settlement ID: {}, Creator ID: {}", 
                            settlement.getId(), creator.getId());
                } else {
                    failCount++;
                    log.warn("정산 재시도 실패 - Settlement ID: {}, Creator ID: {}, 재시도 횟수: {}/{}", 
                            settlement.getId(), creator.getId(), settlement.getRetryCount(), maxRetryCount);
                }
            } catch (Exception e) {
                log.error("정산 재시도 중 오류 발생 - Settlement ID: {}", settlement.getId(), e);
                failCount++;
            }
        }
        
        log.info("지급 실패 정산 재시도 배치 완료: 성공 {}건, 실패 {}건", successCount, failCount);
    }
}

