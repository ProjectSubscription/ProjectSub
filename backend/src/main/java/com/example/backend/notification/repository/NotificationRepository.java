package com.example.backend.notification.repository;

import com.example.backend.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // 소프트 삭제된 알림은 가져오지 않고 최신순 내림차순 정렬
    List<Notification> findByMemberIdAndIsDeletedFalseOrderByCreatedAtDesc(Long memberId);

    // 소프트 삭제된 알림과 읽은 알림은 가져오지 않도록
    List<Notification> findByMemberIdAndIsDeletedFalseAndIsReadFalse(Long memberId);
}
