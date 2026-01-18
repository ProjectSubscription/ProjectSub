package com.example.backend.notification.dto.event;

import com.example.backend.notification.dto.response.NotificationResponseDTO;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class NotificationCreatedEvent { // 이벤트 클래스
    private Long memberId;
    private NotificationResponseDTO dto;

    public static NotificationCreatedEvent create(Long memberId, NotificationResponseDTO dto) {
        return NotificationCreatedEvent.builder()
                .memberId(memberId)
                .dto(dto)
                .build();
    }
}
