package com.example.backend.content.entity;

import com.example.backend.channel.entity.Channel;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "contents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 채널 */
   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "channel_id", nullable = false)
   private Channel channel;

    /** 제목 */
    @Column(nullable = false)
    private String title;

    /** 콘텐츠 타입 */
    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;

    /** ContentType이 TEXT일 경우 */
    @Column(columnDefinition = "TEXT")
    private String body;

    /** ContentType이 VIDEO일 경우 */
    @Column(name = "media_url", length = 2048)
    private String mediaUrl;

    /** 접근 타입 */
    @Enumerated(EnumType.STRING)
    @Column(name = "access_type", nullable = false)
    private AccessType accessType;

    /** 미리보기 비율 (PARTIAL 전용) */
    @Column(name = "preview_ratio")
    private Integer previewRatio;

    /** 단건 판매가 */
    @Column(nullable = false)
    private Integer price;

    /** 조회수 */
    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Long viewCount = 0L;

    /** 좋아요 수 */
    @Column(name = "like_count", nullable = false)
    @Builder.Default
    private Long likeCount = 0L;

    /** 게시 시점 (임시저장 / 예약 발행 고려) */
    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    /** Soft Delete */
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    /** 생성 시점 */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static Content create(
            Channel channel,
            String title,
            ContentType contentType,
            AccessType accessType,
            Integer previewRatio,
            String body,
            String mediaUrl,
            Integer price,
            LocalDateTime publishedAt
    ) {
        return Content.builder()
                .channel(channel)
                .title(title)
                .contentType(contentType)
                .accessType(accessType)
                .previewRatio(previewRatio)
                .body(body)
                .mediaUrl(mediaUrl)
                .price(price)
                .publishedAt(publishedAt)
                .viewCount(0L)
                .likeCount(0L)
                .isDeleted(false)
                .build();
    }

    /**
     * 콘텐츠 수정 (제목, 타입, 가격)
     */
    public void update(String title, ContentType contentType, AccessType accessType,
                       Integer previewRatio, String body, String mediaUrl,
                       Integer price, LocalDateTime publishedAt) {
        if (title != null) {
            this.title = title;
        }
        if (contentType != null) {
            this.contentType = contentType;
        }
        if (accessType != null) {
            this.accessType = accessType;
        }
        if (previewRatio != null) {
            this.previewRatio = previewRatio;
        }
        if (body != null) {
            this.body = body;
        }
        if (mediaUrl != null) {
            this.mediaUrl = mediaUrl;
        }
        if (price != null) {
            this.price = price;
        }
        if (publishedAt != null) {
            this.publishedAt = publishedAt;
        }
    }

    /**
     * Soft Delete
     */
    public void softDelete() {
        this.isDeleted = true;
    }

    /**
     * 조회수 증가
     */
    public void increaseViewCount() {
        this.viewCount++;
    }

    /**
     * 게시 여부 확인 (publishedAt이 현재 시점 이전인지 확인)
     */
    public boolean isPublished() {
        if (publishedAt == null) {
            return false; // 임시저장
        }
        return publishedAt.isBefore(LocalDateTime.now()) || publishedAt.isEqual(LocalDateTime.now());
    }

    /**
     * 좋아요 증가
     *
     */
    public void increaseLikeCount() {
        this.likeCount++;
    }

    /**
     * 좋아요 감소
     *
     */
    public void decreaseLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }
}
