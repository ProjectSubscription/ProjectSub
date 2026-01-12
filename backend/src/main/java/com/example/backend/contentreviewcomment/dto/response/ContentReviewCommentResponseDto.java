package com.example.backend.contentreviewcomment.dto.response;

import com.example.backend.contentreviewcomment.entity.ContentReviewComment;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class ContentReviewCommentResponseDto {
    private Long id;
    private Long reviewId;
    private Long memberId;
    private Long parentId;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ContentReviewCommentResponseDto> children = new ArrayList<>();

    public ContentReviewCommentResponseDto(ContentReviewComment comment) {
        this.id = comment.getId();
        this.reviewId = comment.getContentReview().getId();
        this.memberId = comment.getMember().getId();
        this.parentId = comment.getParent() != null ? comment.getParent().getId() : null;
        this.comment = comment.getComment();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
        this.children = comment.getChildren().stream()
                .map(ContentReviewCommentResponseDto::new)
                .collect(Collectors.toList());
    }
}