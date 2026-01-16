package com.example.backend.notification.service;

import com.example.backend.notification.dto.response.NotificationResponseDTO;
import com.example.backend.notification.entity.Notification;
import com.example.backend.notification.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class NotificationSseService {

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final NotificationRepository notificationRepository;

    public NotificationSseService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public SseEmitter subscribe(Long memberId) {

        SseEmitter emitter = new SseEmitter(60L * 60 * 1000);// 1시간 타임아웃
        emitters.put(memberId, emitter);

        // 콜백 설정 - 메모리 누수 방지
        emitter.onCompletion(() -> emitters.remove(memberId)); // 연결을 정상적으로 마쳤을 때
        emitter.onTimeout(() -> emitters.remove(memberId)); // 타임아웃
        emitter.onError(e -> emitters.remove(memberId)); // 에러

        // 최초 연결 확인
        send(memberId, "CONNECTED");

        // 오프라인일때 왔던 알림 보내기
        sendUnread(memberId, emitter);

        return emitter;
    }

    public void send(Long memberId, Object data) {
        SseEmitter emitter = emitters.get(memberId);
        if (emitter == null) return;

        try {
            emitter.send(SseEmitter.event()
                    .name("notification")
                    .data(data));
        } catch (IOException e) {
            // 에러발생 - 연결이 끊겼다는 것이므로 데이터 정리.
            emitters.remove(memberId);
        }
    }

    // 오프라인일때 왔던 알림 로그인했을때 보내기
    private void sendUnread(Long memberId, SseEmitter emitter) {
        List<Notification> unread =
                notificationRepository.findByMemberIdAndIsDeletedFalseAndIsReadFalse(memberId);

        for (Notification n : unread) {
            try {
                emitter.send(NotificationResponseDTO.create(n));
            } catch (IOException e) {
                emitters.remove(memberId);
                break;
            }
        }
    }
}
