package com.example.backend.coupon.repository;

import com.example.backend.coupon.entity.CouponTarget;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponTargetRepository extends JpaRepository<CouponTarget, Long> {
}
