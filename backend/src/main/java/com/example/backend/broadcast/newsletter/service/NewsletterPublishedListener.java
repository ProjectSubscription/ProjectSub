package com.example.backend.broadcast.newsletter.service;

import com.example.backend.broadcast.newsletter.dto.event.NewsletterPublishedEvent;
import com.example.backend.notification.service.NotificationService;
import com.example.backend.notification.service.NotificationSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NewsletterPublishedListener {

    private final NotificationService notificationService;
    private final NotificationSettingService notificationSettingService;

    @Async // 메인스레드와 분리되어 백그라운드에서 알림이 발송된다.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(NewsletterPublishedEvent event) {

        // 모든 활동중인 회원들 List<Long> 으로 가져오기
        List<Long> activeMemberIds = null;

        // 뉴스레터 알림 켜져있는 회원들만 다시 List<Long>으로 가져오기
        List<Long> targetMemberIds = null;

        // 그 회원들로 iter
        // notificationService.createNotification(notificationDTO);
    }



}
