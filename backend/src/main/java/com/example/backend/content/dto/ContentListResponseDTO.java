package com.example.backend.content.dto;

import com.example.backend.content.entity.AccessType;
import com.example.backend.content.entity.Content;
import com.example.backend.content.entity.ContentType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ContentListResponseDTO {

    private Long contentId;
    private Long channelId;
    private String title;
    private ContentType contentType;
    private AccessType accessType;
    private Integer previewRatio;
    private Integer price;
    private Long viewCount;
    private Long likeCount;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;

    public static ContentListResponseDTO from(Content content) {
        return ContentListResponseDTO.builder()
                .contentId(content.getId())
                .channelId(content.getChannel().getId())
                .title(content.getTitle())
                .contentType(content.getContentType())
                .accessType(content.getAccessType())
                .previewRatio(content.getPreviewRatio())
                .price(content.getPrice())
                .viewCount(content.getViewCount())
                .likeCount(content.getLikeCount())
                .publishedAt(content.getPublishedAt())
                .createdAt(content.getCreatedAt())
                .build();
    }
}
