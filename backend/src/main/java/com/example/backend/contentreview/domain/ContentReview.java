package com.example.backend.contentreview.domain;

import com.example.backend.content.domain.Content;
import com.example.backend.member.entity.Member;
import com.example.backend.global.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
@Table(name = "content_reviews")
public class ContentReview extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private int rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false)
    private boolean isDeleted = false;

    public static ContentReview create(Content content, Member member, int rating, String comment) {
        return ContentReview.builder()
                .content(content)
                .member(member)
                .rating(rating)
                .comment(comment)
                .build();
    }

    public void update(int rating, String comment) {
        this.rating = rating;
        this.comment = comment;
    }

    public void changeDeleteStatus() {
        this.isDeleted = true;
    }
}