package com.example.backend.contentreviewcomment.dto.response;

import com.example.backend.contentreviewcomment.entity.ContentReviewComment;
import com.example.backend.member.entity.Member;
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
    private String nickname;
    private Long parentId;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ContentReviewCommentResponseDto> children = new ArrayList<>();

    // 자식 댓글 설정을 위한 setter (Service에서 사용)
    public void setChildren(List<ContentReviewCommentResponseDto> children) {
        this.children = children;
    }

    public ContentReviewCommentResponseDto(ContentReviewComment comment) {
        this.id = comment.getId();
        this.reviewId = comment.getContentReview().getId();
        this.memberId = comment.getMember().getId();
        // 탈퇴한 사용자는 "탈퇴한 사용자"로 표시
        this.nickname = comment.getMember().isDeleted() 
                ? "탈퇴한 사용자" 
                : comment.getMember().getNickname();
        this.parentId = comment.getParent() != null ? comment.getParent().getId() : null;
        this.comment = comment.getComment();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
        this.children = comment.getChildren().stream()
                .map(ContentReviewCommentResponseDto::new)
                .collect(Collectors.toList());
    }

    /**
     * Member를 직접 받는 생성자 (탈퇴한 사용자 포함 조회용)
     * 자식 댓글도 재귀적으로 처리
     */
    public ContentReviewCommentResponseDto(ContentReviewComment comment, Member member) {
        this.id = comment.getId();
        this.reviewId = comment.getContentReview().getId();
        this.memberId = member.getId();
        // 탈퇴한 사용자는 "탈퇴한 사용자"로 표시
        this.nickname = member.isDeleted() 
                ? "탈퇴한 사용자" 
                : member.getNickname();
        this.parentId = comment.getParent() != null ? comment.getParent().getId() : null;
        this.comment = comment.getComment();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
        // 자식 댓글도 Member를 별도로 조회해야 하므로, Service에서 처리하도록 수정 필요
        // 일단 기존 방식 유지 (자식 댓글은 별도로 처리)
        this.children = new ArrayList<>();
    }
}