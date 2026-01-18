package com.example.backend.notification.service;

import com.example.backend.notification.dto.event.NotificationCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationCreatedListener {

    private final NotificationSseService notificationSseService;

    @Async // 메인스레드와 분리되어 백그라운드에서 알림이 발송된다.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(NotificationCreatedEvent event) {
        notificationSseService.send(event.getMemberId(), event.getDto());

        log.info("sse 전송 성공 - memberId={}", event.getMemberId());
    }
}
