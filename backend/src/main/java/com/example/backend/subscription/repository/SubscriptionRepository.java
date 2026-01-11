package com.example.backend.subscription.repository;

import com.example.backend.subscription.entity.Subscription;
import com.example.backend.subscription.entity.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    boolean existsByMemberIdAndChannelIdAndStatus(Long memberId, Long channelId, SubscriptionStatus status);
    List<Subscription> findByMemberIdOrderByStartDateDesc(Long memberId);
}
