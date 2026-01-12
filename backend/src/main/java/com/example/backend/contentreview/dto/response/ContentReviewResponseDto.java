package com.example.backend.contentreview.dto.response;

import com.example.backend.contentreview.domain.ContentReview;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ContentReviewResponseDto {
    private Long id;
    private Long contentId;
    private Long memberId;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ContentReviewResponseDto(ContentReview contentReview) {
        this.id = contentReview.getId();
        this.contentId = contentReview.getContent().getId();
        this.memberId = contentReview.getMember().getId();
        this.rating = contentReview.getRating();
        this.comment = contentReview.getComment();
        this.createdAt = contentReview.getCreatedAt();
        this.updatedAt = contentReview.getUpdatedAt();
    }
}