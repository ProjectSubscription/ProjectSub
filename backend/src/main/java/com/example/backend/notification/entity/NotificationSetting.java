package com.example.backend.notification.entity;

import com.example.backend.notification.dto.request.NotificationSettingUpdateDTO;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name = "notification_settings")
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class NotificationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false, unique = true)
    private Long memberId;

    // 신규 콘텐츠
    @Column(nullable = false)
    @Builder.Default
    private boolean contentNotify = true;

    // 뉴스 레터
    @Column(nullable = false)
    @Builder.Default
    private boolean newsletterNotify = true;

    // 이벤트 / 혜택 / 채널 소식 등
    @Column(nullable = false)
    @Builder.Default
    private boolean eventNotify = true;

    public static NotificationSetting create(Long memberId) {
        return NotificationSetting.builder()
                .memberId(memberId)
                .build();
    }

    public void update(NotificationSettingUpdateDTO dto) {
        this.contentNotify = dto.isContentNotify();
        this.newsletterNotify = dto.isNewsletterNotify();
        this.eventNotify = dto.isEventNotify();
    }

}
