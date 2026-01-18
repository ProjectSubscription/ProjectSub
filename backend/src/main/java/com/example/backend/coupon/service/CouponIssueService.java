package com.example.backend.coupon.service;

import com.example.backend.channel.repository.ChannelRepository;
import com.example.backend.coupon.entity.Coupon;
import com.example.backend.coupon.entity.MemberCoupon;
import com.example.backend.coupon.entity.MemberCouponStatus;
import com.example.backend.coupon.repository.CouponRepository;
import com.example.backend.coupon.repository.MemberCouponRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CouponIssueService {
    private final CouponRepository couponRepository;
    private final MemberCouponRepository memberCouponRepository;
    private final MemberRepository memberRepository;
    private final ChannelRepository channelRepository;

    @Transactional
    public Long issueCoupon(Long memberId, Long couponId) {
        LocalDateTime now = LocalDateTime.now();

        // 회원 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        // 쿠폰 조회
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COUPON_NOT_FOUND));

        // 쿠폰 만료 여부 확인
        if (coupon.isExpired(now)) {
            throw new BusinessException(ErrorCode.COUPON_EXPIRED);
        }

        // 이미 발급받은 쿠폰인지 확인
        if (memberCouponRepository.existsByMemberIdAndCouponId(memberId, couponId)) {
            throw new BusinessException(ErrorCode.COUPON_ALREADY_ISSUED);
        }

        // MemberCoupon 생성 및 저장
        MemberCoupon memberCoupon = MemberCoupon.issue(member, coupon);
        MemberCoupon savedMemberCoupon = memberCouponRepository.save(memberCoupon);

        return savedMemberCoupon.getId();
    }
}
