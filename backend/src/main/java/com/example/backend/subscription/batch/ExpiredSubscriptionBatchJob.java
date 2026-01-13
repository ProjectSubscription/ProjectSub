package com.example.backend.subscription.batch;

import com.example.backend.subscription.entity.Subscription;
import com.example.backend.subscription.entity.SubscriptionStatus;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.database.JpaItemWriter;
import org.springframework.batch.item.database.JpaPagingItemReader;
import org.springframework.batch.item.database.builder.JpaItemWriterBuilder;
import org.springframework.batch.item.database.builder.JpaPagingItemReaderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class ExpiredSubscriptionBatchJob {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final EntityManagerFactory entityManagerFactory;
    private final ExpireSubscriptionProcessor expireSubscriptionProcessor;

    @Bean
    public Job expiredSubscriptionsJob() {
        return new JobBuilder("expiredSubscriptionsJob", jobRepository)
                .start(expiredSubscriptionsStep())
                .build();
    }

    @Bean
    public Step expiredSubscriptionsStep() {
        return new StepBuilder("expiredSubscriptionsStep", jobRepository)
                .<Subscription, Subscription>chunk(100, transactionManager)
                .reader(expiredSubscriptionReader())
                .processor(expireSubscriptionProcessor)
                .writer(expiredSubscriptionWriter())
                .build();
    }

    @Bean
    public JpaPagingItemReader<Subscription> expiredSubscriptionReader() {
        LocalDateTime now = LocalDateTime.now();
        return new JpaPagingItemReaderBuilder<Subscription>()
                .name("expiredSubscriptionReader")
                .entityManagerFactory(entityManagerFactory)
                .queryString("""
                    SELECT s FROM Subscription s
                    WHERE s.status = :status
                    AND s.expiredAt <= :now
                """)
                .parameterValues(Map.of(
                        "status", SubscriptionStatus.ACTIVE,
                        "now", now
                ))
                .pageSize(100)
                .build();
    }

    @Bean
    public ItemWriter<Subscription> expiredSubscriptionWriter() {
        return new JpaItemWriterBuilder<Subscription>()
                .entityManagerFactory(entityManagerFactory)
                .build();
    }
}
