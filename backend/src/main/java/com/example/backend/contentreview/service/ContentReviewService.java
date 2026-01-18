package com.example.backend.contentreview.service;

import com.example.backend.content.entity.AccessType;
import com.example.backend.content.entity.Content;
import com.example.backend.content.repository.ContentRepository;
import com.example.backend.contentreview.entity.ContentReview;
import com.example.backend.contentreview.dto.request.ContentReviewRequestDto;
import com.example.backend.contentreview.dto.response.ContentReviewResponseDto;
import com.example.backend.contentreview.repository.ContentReviewRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import com.example.backend.order.entity.OrderStatus;
import com.example.backend.order.entity.OrderType;
import com.example.backend.order.repository.OrderRepository;
import com.example.backend.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentReviewService {

    private final ContentReviewRepository contentReviewRepository;
    private final MemberService memberService;
    private final ContentRepository contentRepository;
    private final OrderRepository orderRepository;
    private final SubscriptionService subscriptionService;

    @Transactional
    public ContentReviewResponseDto createReview(Long contentId, Long memberId, ContentReviewRequestDto request) {

        if (contentReviewDupCheck(contentId, memberId)) {
            throw new BusinessException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        Member member = memberService.findMemberIncludingDeleted(memberId);

        // ContentService는 DTO만 반환하므로 엔티티 참조를 위해 Repository 직접 사용
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONTENT_NOT_FOUND));

        // 리뷰 작성 권한 확인 (구매/구독 여부)
        validateContentAccess(content, memberId);

        ContentReview contentReview = ContentReview.create(content, member, request.getRating(), request.getComment());

        ContentReview savedReview = contentReviewRepository.save(contentReview);
        return new ContentReviewResponseDto(savedReview);
    }

    @Transactional
    public ContentReviewResponseDto updateReview(Long reviewId, ContentReviewRequestDto request) {
        ContentReview contentReview = findContentReviewById(reviewId);

        contentReview.update(request.getRating(), request.getComment());
        return new ContentReviewResponseDto(contentReview);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        ContentReview contentReview = findContentReviewById(reviewId);
        contentReview.changeDeleteStatus();
    }

    public ContentReviewResponseDto getReview(Long reviewId) {
        ContentReview contentReview = findContentReviewById(reviewId);
        return new ContentReviewResponseDto(contentReview);
    }

    public List<ContentReviewResponseDto> getReviewsByContent(Long contentId) {
        return contentReviewRepository.findByContentIdAndIsDeletedFalse(contentId).stream()
                .map(ContentReviewResponseDto::new)
                .collect(Collectors.toList());
    }

    public boolean contentReviewDupCheck(Long contentId, Long memberId) {
        return contentReviewRepository.existsByContentIdAndMemberIdAndIsDeletedFalse(contentId, memberId);
    }

    public ContentReview findContentReviewById(Long reviewId) {
        return contentReviewRepository.findById(reviewId)
                .orElseThrow(() -> new BusinessException(ErrorCode.REVIEW_NOT_FOUND));
    }

    /**
     * 콘텐츠 접근 권한 확인 (구매/구독 여부)
     * 리뷰 작성 권한이 있는지 확인합니다.
     */
    private void validateContentAccess(Content content, Long memberId) {
        AccessType accessType = content.getAccessType();
        
        // 무료 콘텐츠는 항상 접근 가능
        if (accessType == AccessType.FREE) {
            return;
        }

        Long channelId = content.getChannel().getId();
        
        // 1. 채널 구독 내역 확인 (Service 메서드 사용)
        boolean hasActiveSubscription = subscriptionService.hasActiveSubscription(memberId, channelId);
        
        // 2. 콘텐츠 단건 구매 내역 확인 (Repository 직접 사용)
        boolean hasPurchasedContent = orderRepository.existsByMemberIdAndContentIdAndOrderTypeAndStatus(
                memberId, content.getId(), OrderType.CONTENT, OrderStatus.PAID);
        
        // 접근 타입에 따라 접근 권한 결정
        boolean hasAccess = false;
        if (accessType == AccessType.SUBSCRIBER_ONLY) {
            // 구독자만 접근 가능: 채널 구독 내역 확인
            hasAccess = hasActiveSubscription;
        } else if (accessType == AccessType.SINGLE_PURCHASE || accessType == AccessType.PARTIAL) {
            // 단건 구매/미리보기 콘텐츠: 구매 내역 또는 구독 내역 확인 (구독자도 접근 가능)
            hasAccess = hasPurchasedContent || hasActiveSubscription;
        }

        if (!hasAccess) {
            throw new BusinessException(ErrorCode.REVIEW_ACCESS_DENIED);
        }
    }
}