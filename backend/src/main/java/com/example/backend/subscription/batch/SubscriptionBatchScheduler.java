package com.example.backend.subscription.batch;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionBatchScheduler {
    private final JobLauncher jobLauncher;
    private final Job expireSubscriptionsJob;

    // 10분마다 실행 (프로덕션용)
    @Scheduled(cron = "0 0/10 * * * *")
    // 테스트용: 10초마다 실행 (필요시 주석 해제)
    // @Scheduled(fixedRate = 10000)
    public void runExpireSubscriptionsJob() {
        try {
            log.info("스케줄러: 만료된 구독 처리 배치 시작");

            // Job 실행에 필요한 파라미터 생성 (중복 실행 방지)
            JobParameters jobParameters = new JobParametersBuilder()
                    .addLong("timestamp", System.currentTimeMillis())
                    .toJobParameters();

            jobLauncher.run(expireSubscriptionsJob, jobParameters);

            log.info("스케줄러: 만료된 구독 처리 배치 완료");
        } catch (Exception e) {
            log.error("배치 실행 실패: {}", e.getMessage(), e);
        }
    }
}
