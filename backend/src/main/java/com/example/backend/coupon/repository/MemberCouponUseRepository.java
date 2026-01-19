package com.example.backend.coupon.repository;

import com.example.backend.coupon.entity.MemberCoupon;
import com.example.backend.coupon.entity.MemberCouponUse;
import com.example.backend.coupon.entity.MemberCouponUseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MemberCouponUseRepository extends JpaRepository<MemberCouponUse, Long> {
    @Query("SELECT mcu FROM MemberCouponUse mcu WHERE mcu.memberCoupon = :memberCoupon AND mcu.status = :status")
    Optional<MemberCouponUse> findByMemberCouponAndStatus(
            @Param("memberCoupon") MemberCoupon memberCoupon,
            @Param("status") MemberCouponUseStatus status
    );
}
