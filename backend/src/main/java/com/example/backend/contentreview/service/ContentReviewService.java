package com.example.backend.contentreview.service;

import com.example.backend.content.entity.AccessType;
import com.example.backend.content.entity.Content;
import com.example.backend.content.repository.ContentRepository;
import com.example.backend.contentreview.entity.ContentReview;
import com.example.backend.contentreview.entity.ContentReviewLike;
import com.example.backend.contentreview.dto.request.ContentReviewRequestDto;
import com.example.backend.contentreview.dto.response.ContentReviewResponseDto;
import com.example.backend.contentreview.dto.response.TopReviewWithContentResponseDto;
import com.example.backend.contentreview.repository.ContentReviewRepository;
import com.example.backend.contentreview.repository.ContentReviewLikeRepository;
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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentReviewService {

    private final ContentReviewRepository contentReviewRepository;
    private final ContentReviewLikeRepository contentReviewLikeRepository;
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
        // Member는 이미 findMemberIncludingDeleted로 조회했으므로 그대로 사용
        return new ContentReviewResponseDto(savedReview, memberId, contentReviewLikeRepository, member);
    }

    @Transactional
    public ContentReviewResponseDto updateReview(Long reviewId, ContentReviewRequestDto request) {
        ContentReview contentReview = findContentReviewById(reviewId);

        contentReview.update(request.getRating(), request.getComment());
        // Member를 탈퇴한 사용자 포함하여 조회
        Member member = memberService.findMemberIncludingDeleted(contentReview.getMember().getId());
        return new ContentReviewResponseDto(contentReview, null, contentReviewLikeRepository, member);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        ContentReview contentReview = findContentReviewById(reviewId);
        contentReview.changeDeleteStatus();
    }

    public ContentReviewResponseDto getReview(Long reviewId, Long memberId) {
        ContentReview contentReview = findContentReviewById(reviewId);
        // Member를 탈퇴한 사용자 포함하여 조회
        Member member = memberService.findMemberIncludingDeleted(contentReview.getMember().getId());
        return new ContentReviewResponseDto(contentReview, memberId, contentReviewLikeRepository, member);
    }

    public List<ContentReviewResponseDto> getReviewsByContent(Long contentId, Long memberId) {
        // 추천 수가 많은 순으로 정렬된 리뷰 조회
        List<ContentReview> reviews = contentReviewRepository.findByContentIdAndIsDeletedFalseOrderByLikeCountDesc(contentId);
        
        // 각 리뷰의 Member를 탈퇴한 사용자 포함하여 조회
        return reviews.stream()
                .map(review -> {
                    // Member를 탈퇴한 사용자 포함하여 조회
                    Member member = memberService.findMemberIncludingDeleted(review.getMember().getId());
                    // Member를 수동으로 설정 (리뷰 엔티티의 member 필드 업데이트)
                    // 리뷰 엔티티는 불변 객체이므로, DTO 생성 시 member를 직접 전달하는 방식으로 변경 필요
                    // 대신 DTO 생성자에서 member를 별도로 조회하도록 수정
                    return new ContentReviewResponseDto(review, memberId, contentReviewLikeRepository, member);
                })
                .collect(Collectors.toList());
    }

    /**
     * 리뷰 추천 토글 (추천/추천 취소)
     * @param reviewId 리뷰 ID
     * @param memberId 회원 ID
     * @return 추천 여부 (true: 추천됨, false: 추천 취소됨)
     */
    @Transactional
    public boolean toggleReviewLike(Long reviewId, Long memberId) {
        ContentReview review = findContentReviewById(reviewId);

        // 이미 추천했는지 확인
        boolean isLiked = contentReviewLikeRepository.existsByReviewIdAndMemberId(reviewId, memberId);

        if (isLiked) {
            // 추천 취소
            contentReviewLikeRepository.deleteByReviewIdAndMemberId(reviewId, memberId);
            return false;
        } else {
            // 추천 추가
            ContentReviewLike reviewLike = ContentReviewLike.create(reviewId, memberId);
            contentReviewLikeRepository.save(reviewLike);
            return true;
        }
    }

    public boolean contentReviewDupCheck(Long contentId, Long memberId) {
        return contentReviewRepository.existsByContentIdAndMemberIdAndIsDeletedFalse(contentId, memberId);
    }

    public ContentReview findContentReviewById(Long reviewId) {
        return contentReviewRepository.findById(reviewId)
                .orElseThrow(() -> new BusinessException(ErrorCode.REVIEW_NOT_FOUND));
    }

    /**
     * 채널별 최근 리뷰 조회 (최대 5개)
     * @param channelId 채널 ID
     * @param memberId 현재 로그인한 회원 ID (null 가능, 추천 여부 확인용)
     * @return 채널별 최근 리뷰 목록 (최대 5개)
     */
    public List<ContentReviewResponseDto> getRecentReviewsByChannel(Long channelId, Long memberId) {
        // 채널별 최근 리뷰 5개 조회 (최신순 정렬)
        List<ContentReview> reviews = contentReviewRepository.findByChannelIdAndIsDeletedFalseOrderByCreatedAtDesc(
                channelId, PageRequest.of(0, 5));
        
        // 각 리뷰의 Member를 탈퇴한 사용자 포함하여 조회
        return reviews.stream()
                .map(review -> {
                    // Member를 탈퇴한 사용자 포함하여 조회
                    Member member = memberService.findMemberIncludingDeleted(review.getMember().getId());
                    return new ContentReviewResponseDto(review, memberId, contentReviewLikeRepository, member);
                })
                .collect(Collectors.toList());
    }

    /**
     * 콘텐츠별로 가장 추천이 많은 리뷰 하나씩 조회 (콘텐츠 정보 포함)
     * @param limit 조회할 콘텐츠 개수 (각 콘텐츠당 리뷰 1개씩)
     * @return 각 콘텐츠별 추천 수가 가장 많은 리뷰 목록
     */
    public List<TopReviewWithContentResponseDto> getTopReviewsByLikeCount(int limit) {
        // 모든 리뷰를 가져와서 콘텐츠별로 그룹화
        List<ContentReview> allReviews = contentReviewRepository.findAllWithContentAndChannel();
        
        // 콘텐츠별로 그룹화하고, 각 콘텐츠에서 추천 수가 가장 많은 리뷰 하나씩 선택
        Map<Long, ContentReview> topReviewPerContent = allReviews.stream()
                .collect(Collectors.groupingBy(
                        review -> review.getContent().getId(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                reviews -> reviews.stream()
                                        .max(Comparator.comparingLong((ContentReview review) -> 
                                                contentReviewLikeRepository.countByReviewId(review.getId())
                                        ).thenComparing(ContentReview::getCreatedAt, Comparator.reverseOrder()))
                                        .orElse(null)
                        )
                ))
                .entrySet().stream()
                .filter(entry -> entry.getValue() != null)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        
        // 추천 수 기준으로 정렬하고 limit만큼 선택
        List<ContentReview> topReviews = topReviewPerContent.values().stream()
                .sorted(Comparator.comparingLong((ContentReview review) -> 
                        contentReviewLikeRepository.countByReviewId(review.getId())
                ).reversed()
                .thenComparing(ContentReview::getCreatedAt, Comparator.reverseOrder()))
                .limit(limit)
                .collect(Collectors.toList());
        
        // 각 리뷰의 Member를 탈퇴한 사용자 포함하여 조회
        return topReviews.stream()
                .map(review -> {
                    // Member를 탈퇴한 사용자 포함하여 조회
                    Member member = memberService.findMemberIncludingDeleted(review.getMember().getId());
                    return new TopReviewWithContentResponseDto(review, contentReviewLikeRepository, member);
                })
                .collect(Collectors.toList());
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