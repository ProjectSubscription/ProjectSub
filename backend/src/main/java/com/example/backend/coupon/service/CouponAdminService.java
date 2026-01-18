package com.example.backend.coupon.service;

import com.example.backend.coupon.dto.request.CouponCreateRequest;
import com.example.backend.coupon.dto.request.CouponUpdateRequest;
import com.example.backend.coupon.dto.response.CouponListResponse;
import com.example.backend.coupon.dto.response.CouponResponse;
import com.example.backend.coupon.entity.Coupon;
import com.example.backend.coupon.entity.CouponTarget;
import com.example.backend.coupon.entity.DiscountType;
import com.example.backend.coupon.entity.RefundType;
import com.example.backend.coupon.repository.CouponRepository;
import com.example.backend.coupon.repository.CouponTargetRepository;
import com.example.backend.coupon.repository.MemberCouponRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.Role;
import com.example.backend.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponAdminService {
    private final CouponRepository couponRepository;
    private final CouponTargetRepository couponTargetRepository;
    private final CouponCodeGenerator couponCodeGenerator;
    private final MemberRepository memberRepository;
    private final MemberCouponRepository memberCouponRepository;

    @Transactional
    public CouponResponse createCoupon(Long memberId, CouponCreateRequest request) {
        // ADMIN 권한 검증
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        if (!member.hasRole(Role.ROLE_ADMIN)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        LocalDateTime now = LocalDateTime.now();

        if (!request.expiredAt().isAfter(now)) {
            throw new BusinessException(ErrorCode.INVALID_COUPON_PERIOD);
        }

        validateDiscountValue(request.discountType(), request.discountValue());

        // 서버에서 중복되지 않는 코드 자동 생성
        String generatedCode = couponCodeGenerator.generateUniqueCode();

        RefundType refundType = request.refundType() != null
                ? request.refundType()
                : RefundType.RESTORE_ON_REFUND;

        Coupon coupon = Coupon.create(
                generatedCode,
                request.discountType(),
                request.discountValue(),
                refundType,
                request.expiredAt(),
                request.channelId()
        );

        Coupon savedCoupon = couponRepository.save(coupon);

        // CouponTarget 생성 (있다면)
        if (request.targets() != null) {
            request.targets().forEach(t -> {
                CouponTarget target = (t.targetId() == null)
                        ? CouponTarget.forAll(savedCoupon, t.targetType())
                        : CouponTarget.forSpecific(savedCoupon, t.targetType(), t.targetId());
                couponTargetRepository.save(target);
            });
        }

        return CouponResponse.fromEntity(savedCoupon);
    }

    @Transactional(readOnly = true)
    public Page<CouponListResponse> getCoupons(Long memberId, String status, Pageable pageable) {
        // ADMIN 권한 검증
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        if (!member.hasRole(Role.ROLE_ADMIN)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        LocalDateTime now = LocalDateTime.now();
        Page<Coupon> coupons;

        // 상태 필터링
        if ("active".equalsIgnoreCase(status)) {
            coupons = couponRepository.findActiveCoupons(now, pageable);
        } else if ("expired".equalsIgnoreCase(status)) {
            coupons = couponRepository.findExpiredCoupons(now, pageable);
        } else {
            // 전체 조회
            coupons = couponRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        // 통계 포함하여 응답 생성
        return coupons.map(coupon -> {
            Long issuedCount = memberCouponRepository.countByCouponId(coupon.getId());
            Long usedCount = memberCouponRepository.countUsedByCouponId(coupon.getId());
            return CouponListResponse.fromEntity(coupon, issuedCount != null ? issuedCount : 0L, usedCount != null ? usedCount : 0L);
        });
    }

    @Transactional
    public CouponResponse updateCoupon(Long memberId, Long couponId, CouponUpdateRequest request) {
        // ADMIN 권한 검증
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        if (!member.hasRole(Role.ROLE_ADMIN)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

        // 만료일 수정
        if (request.expiredAt() != null) {
            LocalDateTime now = LocalDateTime.now();
            // 만료일 연장 가능 (새 날짜가 현재보다 이후여야 함)
            // 이미 만료된 쿠폰도 연장 가능
            if (request.expiredAt().isBefore(now) || request.expiredAt().equals(now)) {
                throw new BusinessException(ErrorCode.INVALID_COUPON_PERIOD);
            }
            coupon.updateExpiredAt(request.expiredAt());
        }

        // CouponTarget 수정 (기존 삭제 후 새로 생성)
        if (request.targets() != null) {
            // 기존 CouponTarget 삭제
            List<CouponTarget> existingTargets = couponTargetRepository.findByCouponId(couponId);
            couponTargetRepository.deleteAll(existingTargets);

            // 새로운 CouponTarget 생성
            request.targets().forEach(t -> {
                CouponTarget target = (t.targetId() == null)
                        ? CouponTarget.forAll(coupon, t.targetType())
                        : CouponTarget.forSpecific(coupon, t.targetType(), t.targetId());
                couponTargetRepository.save(target);
            });
        }

        return CouponResponse.fromEntity(coupon);
    }

    private void validateDiscountValue(DiscountType type, Integer value) {
        if (value == null || value <= 0) {
            throw new BusinessException(ErrorCode.INVALID_COUPON_DISCOUNT_VALUE);
        }
        if (type == DiscountType.RATE) {
            if (value < 1 || value > 100) {
                throw new BusinessException(ErrorCode.INVALID_COUPON_DISCOUNT_VALUE);
            }
        }
    }
}
