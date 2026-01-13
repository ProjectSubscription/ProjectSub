package com.example.backend.subscription.batch;

import com.example.backend.subscription.entity.Subscription;
import com.example.backend.subscription.entity.SubscriptionStatus;
import com.example.backend.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class ExpiredSubscriptionBatchJob {

    private final SubscriptionRepository subscriptionRepository;
    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;

    @Bean
    public Job expiredSubscriptionsJob() {
        return new JobBuilder("expiredSubscriptionsJob", jobRepository)
                .start(expiredSubscriptionsStep())
                .build();
    }

    @Bean
    public Step expiredSubscriptionsStep() {
        return new StepBuilder("expiredSubscriptionsStep", jobRepository)
                .tasklet(expireSubscriptionsTasklet(), transactionManager)
                .build();
    }

    @Bean
    public Tasklet expireSubscriptionsTasklet() {
        return (contribution, chunkContext) -> {
            log.info("=== 만료된 구독 처리 배치 시작 ===");

            LocalDateTime now = LocalDateTime.now();

            // 만료된 구독 조회 (end_date가 현재 시간 이하인 경우)
            List<Subscription> expiredSubscriptions = subscriptionRepository
                    .findByStatusAndEndDateLessThanOrEqual(SubscriptionStatus.ACTIVE, now);

            log.info("만료된 구독 수: {}", expiredSubscriptions.size());

            // 만료 처리
            int count = 0;
            for (Subscription subscription : expiredSubscriptions) {
                try {
                    subscription.expire();
                    subscriptionRepository.save(subscription);
                    count++;
                    log.debug("구독 ID {} 만료 처리 완료 (end_date: {})", 
                            subscription.getId(), subscription.getEndDate());
                } catch (Exception e) {
                    log.error("구독 ID {} 만료 처리 실패: {}", subscription.getId(), e.getMessage());
                }
            }

            log.info("=== 만료된 구독 처리 완료: {}건 ===", count);
            return RepeatStatus.FINISHED;
        };
    }
}
