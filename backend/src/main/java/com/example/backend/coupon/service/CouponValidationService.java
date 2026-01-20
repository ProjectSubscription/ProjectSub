package com.example.backend.coupon.service;

import com.example.backend.coupon.dto.response.CouponValidateResponse;
import com.example.backend.coupon.entity.Coupon;
import com.example.backend.coupon.entity.CouponTarget;
import com.example.backend.coupon.entity.CouponTargetType;
import com.example.backend.coupon.entity.MemberCoupon;
import com.example.backend.coupon.entity.MemberCouponUseStatus;
import com.example.backend.coupon.repository.CouponTargetRepository;
import com.example.backend.coupon.repository.MemberCouponRepository;
import com.example.backend.coupon.repository.MemberCouponUseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponValidationService {
    private final MemberCouponRepository memberCouponRepository;
    private final CouponTargetRepository couponTargetRepository;
    private final MemberCouponUseRepository memberCouponUseRepository;

    @Transactional
    public CouponValidateResponse validateCoupon(
            Long memberId,
            Long couponId,
            CouponTargetType paymentType,
            Long targetId
    ) {
        LocalDateTime now = LocalDateTime.now();

        MemberCoupon memberCoupon = memberCouponRepository
                .findByMemberIdAndCouponIdWithLock(memberId, couponId)
                .orElse(null);

        if (memberCoupon == null) {
            return CouponValidateResponse.invalid("NOT_OWNED");
        }

        if (!memberCoupon.isIssued()) {
            return CouponValidateResponse.invalid("ALREADY_USED");
        }

        Coupon coupon = memberCoupon.getCoupon();
        if (coupon.isExpired(now)) {
            return CouponValidateResponse.invalid("EXPIRED");
        }

        List<CouponTarget> applicableTargets = couponTargetRepository
                .findByCouponIdAndTargetTypeAndTargetId(couponId, paymentType, targetId);
        
        if (applicableTargets.isEmpty()) {
            return CouponValidateResponse.invalid("NOT_APPLICABLE_TO_TARGET");
        }

        boolean hasUsedRecord = memberCouponUseRepository
                .findByMemberCouponAndStatus(memberCoupon, MemberCouponUseStatus.USED)
                .isPresent();

        if (hasUsedRecord) {
            return CouponValidateResponse.invalid("ALREADY_USED");
        }

        // 모든 검증 통과
        return CouponValidateResponse.valid();
    }
}
