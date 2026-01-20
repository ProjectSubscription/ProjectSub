package com.example.backend.channel.dto.request;

import com.example.backend.channel.entity.ChannelCategory;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class ChannelCreateRequest {
    private String title;

    private String description;

    private String thumbnailUrl;

    private ChannelCategory category;

    public static ChannelCreateRequest create(String title, String description, String thumbnailUrl,
                                              ChannelCategory category) {
        return ChannelCreateRequest.builder()
                .title(title)
                .description(description)
                .thumbnailUrl(thumbnailUrl)
                .category(category)
                .build();
    }
}
