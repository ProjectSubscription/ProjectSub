package com.example.backend.contentreviewcomment.service;

import com.example.backend.content.entity.AccessType;
import com.example.backend.content.entity.Content;
import com.example.backend.contentreview.entity.ContentReview;
import com.example.backend.contentreview.service.ContentReviewService;
import com.example.backend.contentreviewcomment.entity.ContentReviewComment;
import com.example.backend.contentreviewcomment.repository.ContentReviewCommentRepository;
import com.example.backend.contentreviewcomment.dto.request.ContentReviewCommentRequestDto;
import com.example.backend.contentreviewcomment.dto.response.ContentReviewCommentResponseDto;
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
public class ContentReviewCommentService {

    private final ContentReviewCommentRepository contentReviewCommentRepository;
    private final ContentReviewService contentReviewService;
    private final MemberService memberService;
    private final OrderRepository orderRepository;
    private final SubscriptionService subscriptionService;

    @Transactional
    public ContentReviewCommentResponseDto createComment(Long reviewId, Long memberId, ContentReviewCommentRequestDto request) {
        Member member = memberService.findMemberIncludingDeleted(memberId);

        // URL에서 받은 reviewId를 사용
        ContentReview contentReview = contentReviewService.findContentReviewById(reviewId);
        
        // 댓글 작성 권한 확인 (구매/구독 여부)
        Content content = contentReview.getContent();
        validateContentAccess(content, memberId);

        ContentReviewComment parent = null;
        if (request.getParentId() != null) {
            parent = contentReviewCommentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
        }

        ContentReviewComment comment = ContentReviewComment.create(contentReview, member, request.getComment(), parent);
        ContentReviewComment savedComment = contentReviewCommentRepository.save(comment);
        // Member는 이미 findMemberIncludingDeleted로 조회했으므로 그대로 사용
        return new ContentReviewCommentResponseDto(savedComment, member);
    }

    public ContentReviewCommentResponseDto getComment(Long commentId) {
        ContentReviewComment comment = contentReviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
        // Member를 탈퇴한 사용자 포함하여 조회
        Member member = memberService.findMemberIncludingDeleted(comment.getMember().getId());
        return new ContentReviewCommentResponseDto(comment, member);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        ContentReviewComment comment = contentReviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
        comment.changeDeleteStatus();
    }

    @Transactional
    public ContentReviewCommentResponseDto updateComment(Long commentId, ContentReviewCommentRequestDto request) {
        ContentReviewComment comment = contentReviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        comment.update(request.getComment());

        // Member를 탈퇴한 사용자 포함하여 조회
        Member member = memberService.findMemberIncludingDeleted(comment.getMember().getId());
        return new ContentReviewCommentResponseDto(comment, member);
    }

    public List<ContentReviewCommentResponseDto> getCommentsByReview(Long reviewId) {
        // 페치 조인이 포함된 메서드 호출 - 대댓글 관련 조회 시 DB에 너무 많이 접근함
        List<ContentReviewComment> comments = contentReviewCommentRepository.findByContentReviewIdWithAllRelations(reviewId);
        
        // 각 댓글의 Member를 탈퇴한 사용자 포함하여 조회하고 DTO 생성
        return comments.stream()
                .map(comment -> {
                    // 부모 댓글의 Member를 탈퇴한 사용자 포함하여 조회
                    Member member = memberService.findMemberIncludingDeleted(comment.getMember().getId());
                    // 자식 댓글도 처리
                    List<ContentReviewCommentResponseDto> childrenDtos = comment.getChildren().stream()
                            .map(child -> {
                                Member childMember = memberService.findMemberIncludingDeleted(child.getMember().getId());
                                return new ContentReviewCommentResponseDto(child, childMember);
                            })
                            .collect(Collectors.toList());
                    ContentReviewCommentResponseDto dto = new ContentReviewCommentResponseDto(comment, member);
                    dto.setChildren(childrenDtos);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * 콘텐츠 접근 권한 확인 (구매/구독 여부)
     * 댓글 작성 권한이 있는지 확인합니다.
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
            throw new BusinessException(ErrorCode.COMMENT_ACCESS_DENIED);
        }
    }
}