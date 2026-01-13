package com.example.backend.subscription.repository;

import com.example.backend.subscription.entity.Subscription;
import com.example.backend.subscription.entity.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    boolean existsByMemberIdAndChannelIdAndStatus(Long memberId, Long channelId, SubscriptionStatus status);
    List<Subscription> findByMemberIdOrderByStartDateDesc(Long memberId);
    List<Subscription> findByChannelIdAndStatus(Long channelId, SubscriptionStatus status);
    List<Subscription> findByStatusAndEndDateBefore(SubscriptionStatus status, LocalDateTime endDate);

    @Query("SELECT s FROM Subscription s WHERE s.status = :status AND s.endDate <= :endDate")
    List<Subscription> findByStatusAndEndDateLessThanOrEqual(
            @Param("status") SubscriptionStatus status,
            @Param("endDate") LocalDateTime endDate
    );
}
