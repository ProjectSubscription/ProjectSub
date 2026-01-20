package com.example.backend.content.entity;

import com.example.backend.global.entity.CreatedAtEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name = "content_likes",
        // 복합 유니크 제약 조건
        uniqueConstraints =
        @UniqueConstraint(columnNames = {"member_id", "content_id"})
)
@Builder(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class ContentLike extends CreatedAtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    public static ContentLike create(Long contentId, Long memberId) {
        return ContentLike.builder()
                .contentId(contentId)
                .memberId(memberId)
                .build();
    }
}
