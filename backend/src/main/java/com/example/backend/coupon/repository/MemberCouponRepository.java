package com.example.backend.coupon.repository;

import com.example.backend.coupon.entity.MemberCoupon;
import com.example.backend.coupon.entity.MemberCouponStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MemberCouponRepository extends JpaRepository<MemberCoupon, Long> {
    boolean existsByMemberIdAndCouponId(Long memberId, Long couponId);
    boolean existsByMemberIdAndCouponIdAndStatus(Long memberId, Long couponId, MemberCouponStatus status);
    Optional<MemberCoupon> findByMemberIdAndCouponId(Long memberId, Long couponId);
    List<MemberCoupon> findByMemberId(Long memberId);

    @Query("SELECT COUNT(mc) FROM MemberCoupon mc WHERE mc.coupon.id = :couponId")
    Long countByCouponId(@Param("couponId") Long couponId);

    @Query("SELECT COUNT(mc) FROM MemberCoupon mc WHERE mc.coupon.id = :couponId AND mc.status = 'USED'")
    Long countUsedByCouponId(@Param("couponId") Long couponId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT mc FROM MemberCoupon mc WHERE mc.member.id = :memberId AND mc.coupon.id = :couponId")
    Optional<MemberCoupon> findByMemberIdAndCouponIdWithLock(@Param("memberId") Long memberId, @Param("couponId") Long couponId);
}
