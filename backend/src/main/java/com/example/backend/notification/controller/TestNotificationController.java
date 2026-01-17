package com.example.backend.notification.controller;

import com.example.backend.global.security.CustomUserDetails;
import com.example.backend.notification.dto.request.NotificationDTO;
import com.example.backend.notification.dto.response.NotificationResponseDTO;
import com.example.backend.notification.dto.response.NotificationSettingResponseDTO;
import com.example.backend.notification.service.NotificationService;
import com.example.backend.notification.service.NotificationSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Slf4j
public class TestNotificationController {

    private final NotificationService notificationService;
    private final NotificationSettingService notificationSettingService;

    // 알림 생성 test
    @PostMapping("/notifications")
    public ResponseEntity<NotificationResponseDTO> createNotification(@RequestBody NotificationDTO dto) {

        log.info("알림 생성 test start - memberId={}", dto.getMemberId());

        NotificationResponseDTO notification = notificationService.createNotification(dto);

        log.info("알림 생성 성공 - notificationId={}", notification.getNotificationId());

        return ResponseEntity.ok(notification);
    }

    // 알림 설정 생성 test
    @PostMapping("/notification-settings")
    public ResponseEntity<NotificationSettingResponseDTO> createNotificationSettings(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        Long memberId = customUserDetails.getMemberId();

        log.info("알림 설정 생성 test start - memberId={}", memberId);

        NotificationSettingResponseDTO notificationSetting = notificationSettingService.createNotificationSetting(memberId);

        log.info("알림 설정 생성 성공 - dto={}", notificationSetting);

        return ResponseEntity.ok(notificationSetting);
    }

    // 알림 설정 삭제 test
    @DeleteMapping("/notification-settings")
    public ResponseEntity<Void> deleteNotificationSettings(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        Long memberId = customUserDetails.getMemberId();

        notificationSettingService.deleteNotificationSetting(memberId);


        log.info("알림 설정 삭제 성공 - memberId={}", memberId);

        return ResponseEntity.noContent().build();

    }


}
