package com.example.backend.notification.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class NotificationListResponseDTO {
    private List<NotificationResponseDTO> notifications;
    private int notificationCount;

    public static NotificationListResponseDTO create(List<NotificationResponseDTO> notifications,
                                                     int notificationCount) {
        return NotificationListResponseDTO.builder()
                .notifications(notifications)
                .notificationCount(notificationCount)
                .build();
    }
}
