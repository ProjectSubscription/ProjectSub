package com.example.backend.coupon.repository;

import com.example.backend.coupon.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);

    /**
     * 특정 채널에 연결된 쿠폰 목록 조회 (만료되지 않은 쿠폰만)
     */
    @Query("SELECT c FROM Coupon c WHERE c.channelId = :channelId AND c.expiredAt > :now ORDER BY c.createdAt DESC")
    List<Coupon> findAvailableCouponsByChannelId(@Param("channelId") Long channelId, @Param("now") LocalDateTime now);

    /**
     * 특정 채널에 연결된 모든 쿠폰 목록 조회
     */
    List<Coupon> findByChannelIdOrderByCreatedAtDesc(Long channelId);
}
