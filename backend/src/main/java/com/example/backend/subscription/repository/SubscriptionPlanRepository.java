package com.example.backend.subscription.repository;

import com.example.backend.subscription.entity.PlanType;
import com.example.backend.subscription.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    boolean existsByChannelIdAndPlanType(Long channelId, PlanType planType);

    @Query("SELECT sp FROM SubscriptionPlan sp WHERE sp.channelId = :channelId AND sp.isActive = true ORDER BY sp.planType")
    List<SubscriptionPlan> findActivePlans(@Param("channelId") Long channelId);
}
