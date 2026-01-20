package com.example.backend.broadcast.newsletter.dto.event;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class NewsletterPublishedEvent {
    private Long newsletterId;
    private String title;

    public static NewsletterPublishedEvent create(Long newsletterId, String title) {
        return NewsletterPublishedEvent.builder()
                .newsletterId(newsletterId)
                .title(title)
                .build();
    }
}
