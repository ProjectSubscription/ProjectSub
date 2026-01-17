package com.example.backend.coupon.repository;

import com.example.backend.coupon.entity.CouponTarget;
import com.example.backend.coupon.entity.CouponTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CouponTargetRepository extends JpaRepository<CouponTarget, Long> {

    List<CouponTarget> findByCouponId(Long couponId);
    List<CouponTarget> findByCouponIdAndTargetType(Long couponId, CouponTargetType targetType);

    @Query("SELECT ct FROM CouponTarget ct " +
           "WHERE ct.targetType = :targetType " +
           "AND (ct.targetId IN (SELECT sp.id FROM com.example.backend.subscription.entity.SubscriptionPlan sp WHERE sp.channelId = :channelId) " +
           "OR ct.targetId IS NULL)")
    List<CouponTarget> findSubscriptionTargetsByChannelId(
            @Param("channelId") Long channelId,
            @Param("targetType") CouponTargetType targetType
    );

    @Query("SELECT ct FROM CouponTarget ct " +
           "WHERE ct.targetType = :targetType " +
           "AND (ct.targetId IN (SELECT c.id FROM com.example.backend.content.entity.Content c WHERE c.channel.id = :channelId) " +
           "OR ct.targetId IS NULL)")
    List<CouponTarget> findContentTargetsByChannelId(
            @Param("channelId") Long channelId,
            @Param("targetType") CouponTargetType targetType
    );

    @Query("SELECT ct FROM CouponTarget ct " +
           "WHERE ct.coupon.id = :couponId " +
           "AND ct.targetType = :targetType " +
           "AND (:targetId IS NULL OR ct.targetId = :targetId OR ct.targetId IS NULL)")
    List<CouponTarget> findByCouponIdAndTargetTypeAndTargetId(
            @Param("couponId") Long couponId,
            @Param("targetType") CouponTargetType targetType,
            @Param("targetId") Long targetId
    );
}
