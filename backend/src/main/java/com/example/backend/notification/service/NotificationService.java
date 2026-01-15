package com.example.backend.notification.service;

import com.example.backend.notification.dto.request.NotificationDTO;
import com.example.backend.notification.dto.response.NotificationListResponseDTO;
import com.example.backend.notification.dto.response.NotificationResponseDTO;
import com.example.backend.notification.entity.Notification;
import com.example.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // 알림 생성
    public NotificationResponseDTO createNotification(NotificationDTO dto) {
        Notification notification = Notification.create(dto);
        Notification save = notificationRepository.save(notification);

        log.info("알림 저장 성공 - message={}", save.getMessage());

        return NotificationResponseDTO.create(save);
    }

    // 알림 조회
    public NotificationListResponseDTO getNotifications(Long memberId) {
        List<NotificationResponseDTO> list =
                notificationRepository.findByMemberIdAndIsDeletedFalseOrderByCreatedAtDesc(memberId)
                        .stream()
                        .map(NotificationResponseDTO::create)
                        .toList();
        int size = list.size();

        log.info("알림 조회 - size={}", size);

        return NotificationListResponseDTO.create(list, size);
    }

    // 알림 읽음 처리
    public void readNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(); // todo: ErrorCode 추가 후 수정
        notification.read();

        log.info("알림 읽음 처리됨 - notificationId={}", notificationId);
    }

    // 알림 전체 읽음 처리
    public void readAllNotifications(Long memberId) {
        List<Notification> notifications =
                notificationRepository.findByMemberIdAndIsDeletedFalseAndIsReadFalse(memberId);
        for (Notification notification : notifications) {
            notification.read();
        }
        log.info("모든 알림 읽음 처리됨 - memberId={}", memberId);
    }

    // 알림 삭제 (소프트)
    public void deleteNotifications(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(); // todo: ErrorCode 추가 후 수정
        notification.softDelete();
        log.info("알림 소프트 삭제 처리됨 - notificationId={}", notificationId);
    }
}
