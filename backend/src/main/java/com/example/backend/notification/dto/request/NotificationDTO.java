package com.example.backend.notification.dto.request;

import com.example.backend.notification.entity.NotificationType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class NotificationDTO {
    private Long memberId;
    private NotificationType type;
    private String title;
    private String message;
    private Long targetId;

    public static NotificationDTO create(Long memberId, NotificationType type, String title,
                                         String message, Long targetId) {
        return NotificationDTO.builder()
                .memberId(memberId)
                .type(type)
                .title(title)
                .message(message)
                .targetId(targetId)
                .build();
    }
}
