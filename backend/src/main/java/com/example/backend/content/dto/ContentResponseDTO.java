package com.example.backend.content.dto;

import com.example.backend.content.entity.AccessType;
import com.example.backend.content.entity.Content;
import com.example.backend.content.entity.ContentType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ContentResponseDTO {

    private Long contentId;
    private Long channelId;

    private String title;
    private ContentType contentType;
    private AccessType accessType;

    private String body;  // ContentType이 TEXT일 경우
    private String mediaUrl;  // ContentType이 VIDEO일 경우
    private Integer previewRatio;
    private Integer price;

    private Long viewCount;
    private Long likeCount;
    private Boolean isLiked; // 현재 사용자가 좋아요를 눌렀는지 여부

    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;

    public static ContentResponseDTO from(Content content) {
        return ContentResponseDTO.builder()
                .contentId(content.getId())
                .channelId(content.getChannel().getId())
                .title(content.getTitle())
                .contentType(content.getContentType())
                .accessType(content.getAccessType())
                .body(content.getBody())
                .mediaUrl(content.getMediaUrl())
                .previewRatio(content.getPreviewRatio())
                .price(content.getPrice())
                .viewCount(content.getViewCount())
                .likeCount(content.getLikeCount())
                .isLiked(false) // 기본값: 좋아요 안 함
                .publishedAt(content.getPublishedAt())
                .createdAt(content.getCreatedAt())
                .build();
    }

    public static ContentResponseDTO from(Content content, Boolean isLiked) {
        return ContentResponseDTO.builder()
                .contentId(content.getId())
                .channelId(content.getChannel().getId())
                .title(content.getTitle())
                .contentType(content.getContentType())
                .accessType(content.getAccessType())
                .body(content.getBody())
                .mediaUrl(content.getMediaUrl())
                .previewRatio(content.getPreviewRatio())
                .price(content.getPrice())
                .viewCount(content.getViewCount())
                .likeCount(content.getLikeCount())
                .isLiked(isLiked != null ? isLiked : false)
                .publishedAt(content.getPublishedAt())
                .createdAt(content.getCreatedAt())
                .build();
    }
}
