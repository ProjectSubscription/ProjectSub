package com.example.backend.coupon.service;

import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.repository.ChannelRepository;
import com.example.backend.content.entity.Content;
import com.example.backend.content.repository.ContentRepository;
import com.example.backend.coupon.dto.response.ChannelCouponResponse;
import com.example.backend.coupon.entity.Coupon;
import com.example.backend.coupon.entity.CouponTarget;
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
    private final ContentRepository contentRepository;

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

    @Transactional(readOnly = true)
    public List<ChannelCouponResponse> getAvailableCouponsByContent(Long contentId, Long memberId) {
        LocalDateTime now = LocalDateTime.now();

        // 컨텐츠 존재 여부 확인 및 채널 정보 가져오기
        Content content = contentRepository.findByIdAndIsDeletedFalse(contentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        
        Long channelId = content.getChannel().getId();

        // 컨텐츠에 적용 가능한 만료되지 않은 쿠폰 조회
        List<Coupon> coupons = couponRepository.findAvailableCouponsByContentId(channelId, contentId, now);

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
