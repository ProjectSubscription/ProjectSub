package com.example.backend.broadcast.newsletter.dto.response;

import com.example.backend.broadcast.newsletter.entity.Newsletter;
import com.example.backend.broadcast.newsletter.entity.NewsletterStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class NewsletterResponseDTO {
    private Long newsletterId;
    private String title;
    private String content;
    private NewsletterStatus status;
    private LocalDateTime publishedAt;

    public static NewsletterResponseDTO create(Newsletter newsletter) {
        return NewsletterResponseDTO.builder()
                .newsletterId(newsletter.getId())
                .title(newsletter.getTitle())
                .content(newsletter.getContent())
                .status(newsletter.getStatus())
                .publishedAt(newsletter.getPublishedAt())
                .build();
    }
}
