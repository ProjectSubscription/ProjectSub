package com.example.backend.settlement.batch;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SettlementBatchScheduler {

    private final JobLauncher jobLauncher;
    private final Job settlementJob;

    public SettlementBatchScheduler(
            JobLauncher jobLauncher,
            @Qualifier("settlementJob") Job settlementJob
    ) {
        this.jobLauncher = jobLauncher;
        this.settlementJob = settlementJob;
    }


    // 매주 월요일 00:00:00에 실행
    // cron 표현식: 초 분 시 일 월 요일
    // "0 0 0 ? * MON" = 매주 월요일 00:00:00에 실행
    // 전주(월요일 00:00 ~ 일요일 23:59) 정산 처리를 수행

    @Scheduled(cron = "0 0 0 ? * MON")
    public void runSettlementJob() {
        try {
            log.info("정산 배치 스케줄러: 전주 정산 처리 시작");

            // Job 실행에 필요한 파라미터 생성 (중복 실행 방지)
            JobParameters jobParameters = new JobParametersBuilder()
                    .addLong("timestamp", System.currentTimeMillis())
                    .toJobParameters();

            jobLauncher.run(settlementJob, jobParameters);

            log.info("정산 배치 스케줄러: 전주 정산 처리 완료");
        } catch (Exception e) {
            log.error("정산 배치 실행 실패: {}", e.getMessage(), e);
        }
    }
}

