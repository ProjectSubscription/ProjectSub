package com.example.backend.notification.service;

import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.notification.dto.event.NotificationCreatedEvent;
import com.example.backend.notification.dto.request.NotificationDTO;
import com.example.backend.notification.dto.response.NotificationListResponseDTO;
import com.example.backend.notification.dto.response.NotificationResponseDTO;
import com.example.backend.notification.entity.Notification;
import com.example.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    // 알림 생성
    public NotificationResponseDTO createNotification(NotificationDTO dto) {
        Notification notification = Notification.create(dto);
        Notification save = notificationRepository.save(notification);

        log.info("알림 저장 성공 - message={}", save.getMessage());

        NotificationResponseDTO notificationResponseDTO = NotificationResponseDTO.create(save);

        // 이벤트 발행
        applicationEventPublisher.publishEvent(
                NotificationCreatedEvent.create(notification.getMemberId(), notificationResponseDTO)
        );

        log.info("알림 이벤트 발행 - memberId={}", notification.getMemberId());

        return notificationResponseDTO;
    }

    // 알림 조회
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getNotifications(Long memberId) {
        List<NotificationResponseDTO> list =
                notificationRepository.findByMemberIdAndIsDeletedFalseOrderByCreatedAtDesc(memberId)
                        .stream()
                        .map(NotificationResponseDTO::create)
                        .toList();
        log.info("알림 조회 - size={}", list.size());
        return list;
    }

    // 안읽은 알림 개수 조회
    @Transactional(readOnly = true)
    public Long getUnreadNotificationCount(Long memberId) {
        Long count = notificationRepository.countByMemberIdAndIsReadFalseAndIsDeletedFalse(memberId);
        log.info("안읽은 알림 개수 count={}", count);
        return count;
    }

    // 알림 읽음 처리
    public void readNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));
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
    public void deleteNotifications(Long notificationId, Long memberId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTIFICATION_NOT_FOUND));

        // 회원id와 알림의회원id가 다르면 안됨
        if (!notification.getMemberId().equals(memberId)) {
            log.error("회원id와 알림의회원id가 다릅니다. notificationMemberId={}, memberId={}",
                    notification.getMemberId(), memberId);
            throw new BusinessException(ErrorCode.NOTIFICATION_MEMBER_MISMATCH);
        }

        notification.softDelete();
        log.info("알림 소프트 삭제 처리됨 - notificationId={}", notificationId);
    }
}
