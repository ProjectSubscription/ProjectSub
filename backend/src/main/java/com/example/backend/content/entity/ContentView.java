package com.example.backend.content.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "content_view",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_member_content_view",
                        columnNames = {"member_id", "content_id"}
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class ContentView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_viewed_at", nullable = false)
    private LocalDateTime lastViewedAt;

    public void updateLastViewedAt(LocalDateTime viewedAt) {
        this.lastViewedAt = viewedAt;
    }

    public static ContentView create(Long memberId, Long contentId) {
        LocalDateTime now = LocalDateTime.now();
        return ContentView.builder()
                .memberId(memberId)
                .contentId(contentId)
                .createdAt(now)
                .lastViewedAt(now)
                .build();
    }
}
