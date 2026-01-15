package com.example.backend.notification.dto.response;

import com.example.backend.notification.entity.Notification;
import com.example.backend.notification.entity.NotificationType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class NotificationResponseDTO {
    private Long notificationId;
    private NotificationType type;
    private String title;
    private String message;
    private Long targetId;
    private boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationResponseDTO create(Notification entity) {
        return NotificationResponseDTO.builder()
                .notificationId(entity.getId())
                .type(entity.getType())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .targetId(entity.getTargetId())
                .isRead(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
