package com.example.backend.notification.dto.request;

import lombok.Getter;

@Getter
public class NotificationSettingUpdateDTO {
    private boolean contentNotify;
    private boolean newsletterNotify;
    private boolean eventNotify;
}
