package com.example.backend.contentreview.entity;

import com.example.backend.global.entity.CreatedAtEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name = "content_review_likes",
        // 복합 유니크 제약 조건: 한 유저당 한 리뷰에 한 번만 추천 가능
        uniqueConstraints =
        @UniqueConstraint(columnNames = {"member_id", "review_id"})
)
@Builder(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class ContentReviewLike extends CreatedAtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "review_id", nullable = false)
    private Long reviewId;

    public static ContentReviewLike create(Long reviewId, Long memberId) {
        return ContentReviewLike.builder()
                .reviewId(reviewId)
                .memberId(memberId)
                .build();
    }
}
