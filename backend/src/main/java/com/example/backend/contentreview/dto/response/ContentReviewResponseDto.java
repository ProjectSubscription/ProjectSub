package com.example.backend.contentreview.dto.response;

import com.example.backend.contentreview.entity.ContentReview;
import com.example.backend.contentreview.repository.ContentReviewLikeRepository;
import com.example.backend.member.entity.Member;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ContentReviewResponseDto {
    private Long id;
    private Long contentId;
    private Long memberId;
    private String nickname;
    private int rating;
    private String comment;
    private Long likeCount;
    private Boolean isLiked; // 현재 로그인한 사용자가 추천했는지 여부
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ContentReviewResponseDto(ContentReview contentReview) {
        this.id = contentReview.getId();
        this.contentId = contentReview.getContent().getId();
        this.memberId = contentReview.getMember().getId();
        // 탈퇴한 사용자는 "탈퇴한 사용자"로 표시
        this.nickname = contentReview.getMember().isDeleted() 
                ? "탈퇴한 사용자" 
                : contentReview.getMember().getNickname();
        this.rating = contentReview.getRating();
        this.comment = contentReview.getComment();
        this.likeCount = 0L;
        this.isLiked = false;
        this.createdAt = contentReview.getCreatedAt();
        this.updatedAt = contentReview.getUpdatedAt();
    }

    public ContentReviewResponseDto(ContentReview contentReview, Long memberId, ContentReviewLikeRepository likeRepository) {
        this.id = contentReview.getId();
        this.contentId = contentReview.getContent().getId();
        this.memberId = contentReview.getMember().getId();
        // 탈퇴한 사용자는 "탈퇴한 사용자"로 표시
        this.nickname = contentReview.getMember().isDeleted() 
                ? "탈퇴한 사용자" 
                : contentReview.getMember().getNickname();
        this.rating = contentReview.getRating();
        this.comment = contentReview.getComment();
        this.likeCount = likeRepository.countByReviewId(contentReview.getId());
        this.isLiked = memberId != null && likeRepository.existsByReviewIdAndMemberId(contentReview.getId(), memberId);
        this.createdAt = contentReview.getCreatedAt();
        this.updatedAt = contentReview.getUpdatedAt();
    }

    /**
     * Member를 직접 받는 생성자 (탈퇴한 사용자 포함 조회용)
     */
    public ContentReviewResponseDto(ContentReview contentReview, Long memberId, ContentReviewLikeRepository likeRepository, Member member) {
        this.id = contentReview.getId();
        this.contentId = contentReview.getContent().getId();
        this.memberId = member.getId();
        // 탈퇴한 사용자는 "탈퇴한 사용자"로 표시
        this.nickname = member.isDeleted() 
                ? "탈퇴한 사용자" 
                : member.getNickname();
        this.rating = contentReview.getRating();
        this.comment = contentReview.getComment();
        this.likeCount = likeRepository.countByReviewId(contentReview.getId());
        this.isLiked = memberId != null && likeRepository.existsByReviewIdAndMemberId(contentReview.getId(), memberId);
        this.createdAt = contentReview.getCreatedAt();
        this.updatedAt = contentReview.getUpdatedAt();
    }
}