package com.example.backend.notification.dto.response;

import com.example.backend.notification.entity.NotificationSetting;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class NotificationSettingResponseDTO {
    private boolean contentNotify;
    private boolean newsletterNotify;
    private boolean eventNotify;

    public static NotificationSettingResponseDTO create(NotificationSetting entity) {
        return NotificationSettingResponseDTO.builder()
                .contentNotify(entity.isContentNotify())
                .newsletterNotify(entity.isNewsletterNotify())
                .eventNotify(entity.isEventNotify())
                .build();
    }
}
