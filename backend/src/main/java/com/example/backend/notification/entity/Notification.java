package com.example.backend.notification.entity;

import com.example.backend.global.entity.CreatedAtEntity;
import com.example.backend.notification.dto.request.NotificationDTO;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name = "notifications")
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class Notification extends CreatedAtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 알림 받는 사용자
    @Column(name = "member_id", nullable = false, unique = true)
    private Long memberId;

    // 알림 타입(콘텐츠,뉴스레터,이벤트 등)
    @Enumerated(value = EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    // 알림 제목
    @Column(nullable = false)
    private String title;

    // 알림 메시지
    @Column(nullable = false)
    private String message;

    // 알림 타입의 실제 id값 - 이 값으로 클릭 시 해당 화면으로 이동 가능하게 할 수 있음.
    private Long targetId;

    // 읽음 여부
    private boolean isRead;

    // 삭제 여부
    private boolean isDeleted;

    public static Notification create(NotificationDTO dto) {
        return Notification.builder()
                .memberId(dto.getMemberId())
                .type(dto.getType())
                .title(dto.getTitle())
                .message(dto.getMessage()).
                targetId(dto.getTargetId())
                .build();
    }

    // 읽음 처리
    public void read() {
        this.isRead = true;
    }

    // 소프트 삭제
    public void softDelete() {
        this.isDeleted = true;
    }

}
