package com.example.backend.coupon.repository;

import com.example.backend.coupon.entity.CouponTarget;
import com.example.backend.coupon.entity.CouponTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CouponTargetRepository extends JpaRepository<CouponTarget, Long> {
    /**
     * 쿠폰 ID로 모든 대상 조회
     */
    List<CouponTarget> findByCouponId(Long couponId);

    /**
     * 쿠폰 ID와 대상 타입으로 조회
     */
    List<CouponTarget> findByCouponIdAndTargetType(Long couponId, CouponTargetType targetType);

    /**
     * 특정 채널의 구독 상품에 적용 가능한 쿠폰 대상 조회
     * (target_type이 SUBSCRIPTION이고 target_id가 해당 채널의 구독 상품 ID이거나 null인 경우)
     */
    @Query("SELECT ct FROM CouponTarget ct " +
           "WHERE ct.targetType = :targetType " +
           "AND (ct.targetId IN (SELECT sp.id FROM com.example.backend.subscription.entity.SubscriptionPlan sp WHERE sp.channelId = :channelId) " +
           "OR ct.targetId IS NULL)")
    List<CouponTarget> findSubscriptionTargetsByChannelId(
            @Param("channelId") Long channelId,
            @Param("targetType") CouponTargetType targetType
    );

    /**
     * 특정 채널의 콘텐츠에 적용 가능한 쿠폰 대상 조회
     * (target_type이 CONTENT이고 target_id가 해당 채널의 콘텐츠 ID이거나 null인 경우)
     */
    @Query("SELECT ct FROM CouponTarget ct " +
           "WHERE ct.targetType = :targetType " +
           "AND (ct.targetId IN (SELECT c.id FROM com.example.backend.content.entity.Content c WHERE c.channel.id = :channelId) " +
           "OR ct.targetId IS NULL)")
    List<CouponTarget> findContentTargetsByChannelId(
            @Param("channelId") Long channelId,
            @Param("targetType") CouponTargetType targetType
    );
}
