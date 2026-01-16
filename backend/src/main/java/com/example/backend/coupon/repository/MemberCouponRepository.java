package com.example.backend.coupon.repository;

import com.example.backend.coupon.entity.MemberCoupon;
import com.example.backend.coupon.entity.MemberCouponStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberCouponRepository extends JpaRepository<MemberCoupon, Long> {
    /**
     * 회원이 특정 쿠폰을 이미 발급받았는지 확인
     */
    boolean existsByMemberIdAndCouponId(Long memberId, Long couponId);

    /**
     * 회원이 특정 쿠폰을 특정 상태로 보유하고 있는지 확인
     */
    boolean existsByMemberIdAndCouponIdAndStatus(Long memberId, Long couponId, MemberCouponStatus status);

    /**
     * 회원 ID와 쿠폰 ID로 MemberCoupon 조회
     */
    Optional<MemberCoupon> findByMemberIdAndCouponId(Long memberId, Long couponId);
}
