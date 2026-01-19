package com.example.backend.settlement.batch;

import com.example.backend.settlement.service.SettlementPayoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SettlementPayoutRetryScheduler {

    private final SettlementPayoutService settlementPayoutService;


    // 지급 실패 정산 재시도 스케줄러
    // 30분마다 실행 (설정 가능)
    // cron 표현식: 초 분 시 일 월 요일
    // "0 */30 * * * ?" = 30분마다 실행

    @Scheduled(cron = "0 */30 * * * ?")
    public void retryFailedSettlements() {
        try {
            log.info("지급 실패 정산 재시도 스케줄러 실행");
            settlementPayoutService.retryFailedSettlements();
        } catch (Exception e) {
            log.error("지급 실패 정산 재시도 스케줄러 실행 실패: {}", e.getMessage(), e);
        }
    }
}

