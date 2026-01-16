package com.example.backend.coupon.service;

import com.example.backend.coupon.dto.request.CouponCreateRequest;
import com.example.backend.coupon.dto.response.CouponResponse;
import com.example.backend.coupon.entity.Coupon;
import com.example.backend.coupon.entity.CouponTarget;
import com.example.backend.coupon.entity.DiscountType;
import com.example.backend.coupon.entity.RefundType;
import com.example.backend.coupon.repository.CouponRepository;
import com.example.backend.coupon.repository.CouponTargetRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponAdminService {

    private final CouponRepository couponRepository;
    private final CouponTargetRepository couponTargetRepository;
    private final CouponCodeGenerator couponCodeGenerator;

    @Transactional
    public CouponResponse createCoupon(CouponCreateRequest request) {

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
    public List<CouponResponse> getCoupons() {
        return couponRepository.findAll()
                .stream()
                .map(CouponResponse::fromEntity)
                .collect(Collectors.toList());
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
