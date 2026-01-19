package com.example.backend.contentreview.dto.response;

import com.example.backend.contentreview.entity.ContentReview;
import com.example.backend.contentreview.repository.ContentReviewLikeRepository;
import com.example.backend.member.entity.Member;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 가장 추천이 많은 리뷰와 해당 콘텐츠 정보를 포함하는 DTO
 */
@Getter
public class TopReviewWithContentResponseDto {
    private Long reviewId;
    private Long contentId;
    private String contentTitle;
    private String contentThumbnailUrl;
    private Long memberId;
    private String nickname;
    private int rating;
    private String comment;
    private Long likeCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TopReviewWithContentResponseDto(
            ContentReview review,
            ContentReviewLikeRepository likeRepository) {
        this.reviewId = review.getId();
        this.contentId = review.getContent().getId();
        this.contentTitle = review.getContent().getTitle();
        this.contentThumbnailUrl = review.getContent().getMediaUrl(); // 썸네일 URL (mediaUrl 사용)
        this.memberId = review.getMember().getId();
        // 탈퇴한 사용자는 "탈퇴한 사용자"로 표시
        this.nickname = review.getMember().isDeleted() 
                ? "탈퇴한 사용자" 
                : review.getMember().getNickname();
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.likeCount = likeRepository.countByReviewId(review.getId());
        this.createdAt = review.getCreatedAt();
        this.updatedAt = review.getUpdatedAt();
    }

    /**
     * Member를 직접 받는 생성자 (탈퇴한 사용자 포함 조회용)
     */
    public TopReviewWithContentResponseDto(
            ContentReview review,
            ContentReviewLikeRepository likeRepository,
            Member member) {
        this.reviewId = review.getId();
        this.contentId = review.getContent().getId();
        this.contentTitle = review.getContent().getTitle();
        this.contentThumbnailUrl = review.getContent().getMediaUrl(); // 썸네일 URL (mediaUrl 사용)
        this.memberId = member.getId();
        // 탈퇴한 사용자는 "탈퇴한 사용자"로 표시
        this.nickname = member.isDeleted() 
                ? "탈퇴한 사용자" 
                : member.getNickname();
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.likeCount = likeRepository.countByReviewId(review.getId());
        this.createdAt = review.getCreatedAt();
        this.updatedAt = review.getUpdatedAt();
    }
}
