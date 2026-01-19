package com.example.backend.contentreviewcomment.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ContentReviewCommentRequestDto {
    private Long reviewId;
    private Long memberId;

    // 대댓글인 경우 부모 댓글 ID
    private Long parentId;
    private String comment;

    public ContentReviewCommentRequestDto(Long reviewId, Long memberId, Long parentId, String comment) {
        this.reviewId = reviewId;
        this.memberId = memberId;
        this.parentId = parentId;
        this.comment = comment;
    }
}