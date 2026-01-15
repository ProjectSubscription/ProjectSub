package com.example.backend.notification.entity;

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

}
