package com.example.backend.notification.controller;

import com.example.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class NotificationController {

    private final NotificationService notificationService;

    // 알림 조회 GET
    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        return null;
    }

    // 알림 읽음 처리 PATCH
    @PatchMapping("/notifications/{notificationsId}/read")
    public ResponseEntity<?> readNotification(@PathVariable String notificationsId) {
        return null;
    }

    // 알림 전체 읽음 처리 PATCH
    @PatchMapping("/notifications/read-all")
    public ResponseEntity<?> readAllNotification() {
        return null;
    }

    // 알림 설정 조회 GET
    @GetMapping("/notification-settings")
    public ResponseEntity<?> getNotificationSettings() {
        return null;
    }

    // 알림 설정 변경 PATCH
    @PatchMapping("/notification-settings")
    public ResponseEntity<?> updateNotificationSettings() {
        return null;
    }


    // sse 연결 GET
    @GetMapping("/notifications/subscribe")
    public ResponseEntity<?> subscribe() {
        return null;
    }

}
