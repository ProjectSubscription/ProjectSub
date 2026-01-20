package com.example.backend.coupon.service;

import com.example.backend.coupon.entity.MemberCoupon;
import com.example.backend.coupon.entity.MemberCouponUse;
import com.example.backend.coupon.repository.MemberCouponRepository;
import com.example.backend.coupon.repository.MemberCouponUseRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.order.entity.Order;
import com.example.backend.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 쿠폰 사용 처리 서비스
 * 결제 성공 시 쿠폰을 사용 처리합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CouponUseService {
    private final MemberCouponRepository memberCouponRepository;
    private final MemberCouponUseRepository memberCouponUseRepository;

    /**
     * 결제 성공 시 쿠폰 사용 처리
     * @param order 주문 정보
     * @param payment 결제 정보
     */
    @Transactional
    public void useCoupon(Order order, Payment payment) {
        Long memberCouponId = order.getMemberCouponId();
        
        // 쿠폰이 사용되지 않은 경우 처리하지 않음
        if (memberCouponId == null) {
            return;
        }

        // MemberCoupon 조회
        MemberCoupon memberCoupon = memberCouponRepository.findById(memberCouponId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COUPON_NOT_FOUND));

        // 이미 사용된 쿠폰인지 확인
        if (!memberCoupon.isIssued()) {
            log.warn("이미 사용된 쿠폰입니다. memberCouponId={}", memberCouponId);
            return;
        }

        // 할인 금액 계산 (originalAmount - discountAmount)
        Long discountAmount = order.getOriginalAmount() - order.getDiscountAmount();
        if (discountAmount <= 0) {
            log.warn("할인 금액이 0 이하입니다. memberCouponId={}, discountAmount={}", memberCouponId, discountAmount);
            return;
        }

        // MemberCouponUse 생성 및 저장
        MemberCouponUse memberCouponUse = MemberCouponUse.used(memberCoupon, payment, discountAmount);
        memberCouponUseRepository.save(memberCouponUse);

        // MemberCoupon 상태를 USED로 변경
        memberCoupon.markUsed();
        memberCouponRepository.save(memberCoupon);

        log.info("쿠폰 사용 처리 완료: memberCouponId={}, paymentId={}, discountAmount={}",
                memberCouponId, payment.getId(), discountAmount);
    }
}
