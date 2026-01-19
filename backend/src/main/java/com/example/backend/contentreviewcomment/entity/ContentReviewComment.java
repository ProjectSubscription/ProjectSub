package com.example.backend.contentreviewcomment.entity;

import com.example.backend.contentreview.entity.ContentReview;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.global.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
@Table(name = "content_review_comments")
public class ContentReviewComment extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private ContentReview contentReview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ContentReviewComment parent;

    @Builder.Default
    @OneToMany(mappedBy = "parent")
    private List<ContentReviewComment> children = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Builder.Default
    @Column(nullable = false)
    private boolean isDeleted = false;

    public static ContentReviewComment create(ContentReview contentReview, Member member, String comment, ContentReviewComment parent) {
        return ContentReviewComment.builder()
                .contentReview(contentReview)
                .member(member)
                .comment(comment)
                .parent(parent)
                .build();
    }

    public void update(String newComment) {
        if (newComment == null || newComment.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        this.comment = newComment;
    }

    public void changeDeleteStatus() {
        this.isDeleted = true;
    }
}