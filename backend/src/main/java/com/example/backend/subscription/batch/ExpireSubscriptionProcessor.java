package com.example.backend.subscription.batch;

import com.example.backend.subscription.entity.Subscription;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
public class ExpireSubscriptionProcessor implements ItemProcessor<Subscription, Subscription> {

    @Override
    public Subscription process(Subscription subscription) {
        LocalDateTime now = LocalDateTime.now();
        subscription.expire(now);
        log.debug("구독 ID {} 만료 처리 완료 (expired_at: {})", 
                subscription.getId(), subscription.getExpiredAt());
        return subscription;
    }
}
