package com.example.backend.notification.service;

import com.example.backend.notification.dto.request.NotificationSettingUpdateDTO;
import com.example.backend.notification.dto.response.NotificationSettingResponseDTO;
import com.example.backend.notification.entity.NotificationSetting;
import com.example.backend.notification.repository.NotificationSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class NotificationSettingService {

    private final NotificationSettingRepository notificationSettingRepository;

    // 알림 설정 조회
    public NotificationSettingResponseDTO getNotificationSetting(Long memberId) {
        NotificationSetting notificationSetting = notificationSettingRepository.findByMemberId(memberId)
                .orElseThrow(); //todo: 나중에 ErrorCode 추가

        log.info("알림 설정 조회 성공 - contentNotify={}, newsletterNotify={}, eventNotify={}",
                notificationSetting.isContentNotify(), notificationSetting.isNewsletterNotify(), notificationSetting.isEventNotify());

        return NotificationSettingResponseDTO.create(notificationSetting);
    }

    // 알림 설정 생성(회원가입 시)
    public NotificationSettingResponseDTO createNotificationSetting(Long memberId) {

        NotificationSetting notificationSetting = NotificationSetting.create(memberId);

        log.info("알림 설정 성공 - memberId={}", memberId);

        NotificationSetting save = notificationSettingRepository.save(notificationSetting);

        return NotificationSettingResponseDTO.create(save);
    }

    // 알림 설정 변경
    public void updateNotificationSetting(Long memberId, NotificationSettingUpdateDTO dto) {

        log.info("알림 설정 변경 start - memberId={}", memberId);

        NotificationSetting notificationSetting = notificationSettingRepository.findByMemberId(memberId)
                .orElseThrow(); //todo: 나중에 ErrorCode 추가

        notificationSetting.update(dto);

        log.info("알림 설정 변경 완료 - contentNotify={}, newsletterNotify={}, eventNotify={}",
                notificationSetting.isContentNotify(), notificationSetting.isNewsletterNotify(), notificationSetting.isEventNotify());

    }

    // 알림 설정 삭제 - 회원 탈퇴 시
    public void deleteNotificationSetting(Long memberId) {
        notificationSettingRepository.deleteByMemberId(memberId);
        log.info("알림 설정 삭제 완료 - memberId={}", memberId);
    }
}
