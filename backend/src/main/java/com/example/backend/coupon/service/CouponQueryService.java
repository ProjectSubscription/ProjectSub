package com.example.backend.coupon.service;

import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.repository.ChannelRepository;
import com.example.backend.coupon.dto.response.ChannelCouponResponse;
import com.example.backend.coupon.entity.Coupon;
import com.example.backend.coupon.entity.CouponTarget;
import com.example.backend.coupon.entity.CouponTargetType;
import com.example.backend.coupon.repository.CouponRepository;
import com.example.backend.coupon.repository.CouponTargetRepository;
import com.example.backend.coupon.repository.MemberCouponRepository;
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
public class CouponQueryService {

    private final CouponRepository couponRepository;
    private final CouponTargetRepository couponTargetRepository;
    private final MemberCouponRepository memberCouponRepository;
    private final ChannelRepository channelRepository;

    /**
     * 채널별 다운로드 가능한 쿠폰 목록 조회
     * 
     * @param channelId 채널 ID
     * @param memberId 회원 ID (null이면 비회원)
     * @return 채널별 쿠폰 목록 (발급 여부 포함)
     */
    @Transactional(readOnly = true)
    public List<ChannelCouponResponse> getAvailableCouponsByChannel(Long channelId, Long memberId) {
        LocalDateTime now = LocalDateTime.now();

        // 채널 존재 여부 확인
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));

        // 채널에 연결된 만료되지 않은 쿠폰 조회
        List<Coupon> coupons = couponRepository.findAvailableCouponsByChannelId(channelId, now);

        return coupons.stream()
                .map(coupon -> {
                    // 쿠폰 대상 정보 조회
                    List<CouponTarget> targets = couponTargetRepository.findByCouponId(coupon.getId());
                    
                    // 회원이 이미 발급받았는지 확인
                    boolean isIssued = memberId != null && 
                            memberCouponRepository.existsByMemberIdAndCouponId(memberId, coupon.getId());

                    return ChannelCouponResponse.fromEntity(coupon, targets, isIssued);
                })
                .collect(Collectors.toList());
    }
}
