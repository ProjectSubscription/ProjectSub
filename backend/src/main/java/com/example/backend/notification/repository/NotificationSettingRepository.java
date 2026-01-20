package com.example.backend.notification.repository;

import com.example.backend.notification.entity.NotificationSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, Long> {

    Optional<NotificationSetting> findByMemberId(Long memberId);

    void deleteByMemberId(Long memberId);

    boolean existsByMemberId(Long memberId);

    // 특정 회원들 중 콘텐츠 알림 설정이 켜져있는 회원들을 가져온다
    @Query("""
        select ns.memberId
        from NotificationSetting ns
        where ns.memberId in :memberIds
        and ns.contentNotify = true
    """)
    List<Long> findMemberIdByMemberIdInAndContentNotifyTrue(List<Long> memberIds);

    // 위와 같고 뉴스레터 설정 on
    @Query("""
        select ns.memberId
        from NotificationSetting ns
        where ns.memberId in :memberIds
        and ns.newsletterNotify = true
    """)
    List<Long> findMemberIdByMemberIdInAndNewsletterNotifyTrue(List<Long> memberIds);

    // 위와 같고 이벤트 설정 on
    @Query("""
        select ns.memberId
        from NotificationSetting ns
        where ns.memberId in :memberIds
        and ns.eventNotify = true
    """)
    List<Long> findMemberIdByMemberIdInAndEventNotifyTrue(List<Long> memberIds);
}
