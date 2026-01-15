package com.example.backend.notification.controller;

import com.example.backend.global.security.CustomUserDetails;
import com.example.backend.notification.dto.request.NotificationSettingUpdateDTO;
import com.example.backend.notification.dto.response.NotificationListResponseDTO;
import com.example.backend.notification.dto.response.NotificationSettingResponseDTO;
import com.example.backend.notification.service.NotificationService;
import com.example.backend.notification.service.NotificationSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationSettingService notificationSettingService;

    // 알림 조회 GET
    @GetMapping("/notifications")
    public ResponseEntity<NotificationListResponseDTO> getNotifications(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        Long memberId = customUserDetails.getMemberId();

        log.info("알림 조회 start - memberId={}", memberId);

        NotificationListResponseDTO notifications = notificationService.getNotifications(memberId);

        log.info("알림 조회 성공 - count={}", notifications.getNotificationCount());

        return ResponseEntity.ok(notifications);
    }

    // 알림 읽음 처리 PATCH
    @PatchMapping("/notifications/{notificationId}/read")
    public ResponseEntity<Void> readNotification(@PathVariable Long notificationId) {

        log.info("알림 읽음 처리 start - notificationId={}", notificationId);

        notificationService.readNotification(notificationId);

        return ResponseEntity.noContent().build();
    }

    // 알림 전체 읽음 처리 PATCH
    @PatchMapping("/notifications/read-all")
    public ResponseEntity<Void> readAllNotification(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        Long memberId = customUserDetails.getMemberId();

        log.info("알림 전체 읽음 처리 start - memberId={}", memberId);

        notificationService.readAllNotifications(memberId);

        return ResponseEntity.noContent().build();
    }

    // 알림 삭제 DELETE (soft delete)
    @DeleteMapping("/notifications/{notificationId}/delete")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId,
                                                   @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        log.info("알림 soft delete start - notificationId={}", notificationId);

        notificationService.deleteNotifications(notificationId, customUserDetails.getMemberId());

        return ResponseEntity.noContent().build();
    }

    // 알림 설정 조회 GET
    @GetMapping("/notification-settings")
    public ResponseEntity<NotificationSettingResponseDTO> getNotificationSettings(@AuthenticationPrincipal CustomUserDetails customUserDetails) {

        Long memberId = customUserDetails.getMemberId();

        log.info("알림 설정 조회 start - memberId={}", memberId);

        NotificationSettingResponseDTO notificationSetting =
                notificationSettingService.getNotificationSetting(memberId);

        log.info("알림 설정 조회 성공 - dto={}", notificationSetting);

        return ResponseEntity.ok(notificationSetting);
    }

    // 알림 설정 변경 PATCH
    @PatchMapping("/notification-settings")
    public ResponseEntity<?> updateNotificationSettings(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                        @RequestBody NotificationSettingUpdateDTO dto) {
        Long memberId = customUserDetails.getMemberId();

        log.info("알림 설정 변경 start - memberId={}, contentNotify={}, newsletterNotify={}, eventNotify={}",
                memberId, dto.isContentNotify(), dto.isNewsletterNotify(), dto.isEventNotify());

        notificationSettingService.updateNotificationSetting(memberId, dto);
        return null;
    }


    // sse 연결 GET
    @GetMapping("/notifications/subscribe")
    public ResponseEntity<?> subscribe() {
        return null;
    }

}
