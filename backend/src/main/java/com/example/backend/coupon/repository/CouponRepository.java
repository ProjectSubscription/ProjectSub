package com.example.backend.coupon.repository;

import com.example.backend.coupon.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);

    @Query("SELECT c FROM Coupon c WHERE (c.channelId = :channelId OR c.channelId IS NULL) AND c.expiredAt > :now ORDER BY c.createdAt DESC")
    List<Coupon> findAvailableCouponsByChannelId(@Param("channelId") Long channelId, @Param("now") LocalDateTime now);

    List<Coupon> findByChannelIdOrderByCreatedAtDesc(Long channelId);

    @Query("SELECT DISTINCT c FROM Coupon c " +
           "JOIN CouponTarget ct ON ct.coupon.id = c.id " +
           "WHERE (c.channelId = :channelId OR c.channelId IS NULL) " +
           "AND c.expiredAt > :now " +
           "AND ct.targetType = 'CONTENT' " +
           "AND (ct.targetId = :contentId OR ct.targetId IS NULL) " +
           "ORDER BY c.createdAt DESC")
    List<Coupon> findAvailableCouponsByContentId(
            @Param("channelId") Long channelId,
            @Param("contentId") Long contentId,
            @Param("now") LocalDateTime now
    );

    @Query("SELECT c FROM Coupon c WHERE c.expiredAt > :now ORDER BY c.createdAt DESC")
    Page<Coupon> findActiveCoupons(@Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT c FROM Coupon c WHERE c.expiredAt <= :now ORDER BY c.createdAt DESC")
    Page<Coupon> findExpiredCoupons(@Param("now") LocalDateTime now, Pageable pageable);

    Page<Coupon> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
