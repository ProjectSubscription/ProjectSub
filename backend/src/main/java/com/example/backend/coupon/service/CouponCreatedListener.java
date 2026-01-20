package com.example.backend.coupon.service;

import com.example.backend.coupon.dto.event.CouponCreatedEvent;
import com.example.backend.member.service.MemberService;
import com.example.backend.notification.dto.request.NotificationDTO;
import com.example.backend.notification.entity.NotificationType;
import com.example.backend.notification.service.NotificationService;
import com.example.backend.notification.service.NotificationSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CouponCreatedListener {

    private final MemberService memberService;
    private final NotificationSettingService notificationSettingService;
    private final NotificationService notificationService;

    @Async // 메인스레드와 분리되어 백그라운드에서 알림이 발송된다.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(CouponCreatedEvent event) {

        // 모든 활동중인 회원들 List<Long> 으로 가져오기
        List<Long> activeMemberIds = memberService.findAllNonAdminMemberIds();

        // 이벤트 알림 켜져있는 회원들만 다시 List<Long>으로 가져오기
        List<Long> targetMemberIds = notificationSettingService.getTargetMemberIds(activeMemberIds, NotificationType.EVENT);

        // 채널아이디가 존재하면 알림 클릭 시 채널로 이동, null이면 쿠폰 보관함
        for (Long memberId : targetMemberIds) {
            NotificationDTO notificationDTO = event.getChannelId() != null
                    ? CouponNotificationCreator.forChannel(memberId, event.getChannelId())
                    : CouponNotificationCreator.forGlobal(memberId, event.getCouponId());
            notificationService.createNotification(notificationDTO);
        }
    }

    private static class CouponNotificationCreator {
        public static NotificationDTO forChannel(Long memberId, Long channelId) {
            return NotificationDTO.create(memberId,
                    NotificationType.CHANNEL,
                    "채널 전용 쿠폰 도착",
                    "해당 채널에서 바로 사용 가능한 쿠폰을 확인해보세요.",
                    channelId);
        }

        public static NotificationDTO forGlobal(Long memberId, Long couponId) {
            return NotificationDTO.create(memberId,
                    NotificationType.COUPON_MY_PAGE,
                    "새 쿠폰이 도착했습니다.",
                    "지금 쿠폰 보관함에서 사용 가능한 쿠폰을 확인해보세요.",
                    couponId);
        }
    }
}

