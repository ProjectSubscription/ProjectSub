package com.example.backend.content.service;

import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.service.ChannelService;
import com.example.backend.content.dto.event.ContentPublishedEvent;
import com.example.backend.notification.dto.request.NotificationDTO;
import com.example.backend.notification.entity.NotificationType;
import com.example.backend.notification.service.NotificationService;
import com.example.backend.notification.service.NotificationSettingService;
import com.example.backend.subscription.entity.Subscription;
import com.example.backend.subscription.service.SubscriptionService;
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
public class ContentPublishedListener {

    private final NotificationService notificationService;
    private final ChannelService channelService;
    private final SubscriptionService subscriptionService;
    private final NotificationSettingService notificationSettingService;

    @Async // 메인스레드와 분리되어 백그라운드에서 알림이 발송된다.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(ContentPublishedEvent event) {

        Channel channel = channelService.getChannelByCreatorId(event.getCreatorId());

        // 해당 채널의 구독자들 Id 리스트
        List<Long> subscriberIds = subscriptionService.getActiveSubscriptionsByChannelId(channel.getId())
                .stream()
                .map(Subscription::getMemberId)
                .toList();

        // 콘텐츠 수신 알림이 켜져있는 구독자들 리스트
        List<Long> targetMemberIds = notificationSettingService.getTargetMemberIds(subscriberIds);

        for (Long memberId : targetMemberIds) {
            NotificationDTO notificationDTO = NotificationDTO.create(memberId,
                    NotificationType.NEW_CONTENT,
                    "새 콘텐츠가 등록되었습니다.",
                    "구독 중인 크리에이터가 새 콘텐츠를 업로드했습니다.",
                    event.getContentId());

            notificationService.createNotification(notificationDTO);
        }
    }
}
