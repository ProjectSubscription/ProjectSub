package com.example.backend.notification.repository;

import com.example.backend.notification.entity.NotificationSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, Long> {

    Optional<NotificationSetting> findByMemberId(Long memberId);

    void deleteByMemberId(Long memberId);
}
