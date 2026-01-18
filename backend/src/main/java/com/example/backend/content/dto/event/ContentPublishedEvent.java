package com.example.backend.content.dto.event;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class ContentPublishedEvent {
    private Long contentId;
    private Long creatorId;

    public static ContentPublishedEvent create(Long contentId, Long creatorId) {
        return ContentPublishedEvent.builder()
                .contentId(contentId)
                .creatorId(creatorId)
                .build();
    }
}
