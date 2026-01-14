package com.example.backend.creatorapplication.dto;

import com.example.backend.channel.entity.ChannelCategory;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class CreatorApplicationDTO {
    private String channelName;
    private String channelDescription;
    private ChannelCategory category;

    public static CreatorApplicationDTO create(String channelName, String channelDescription, ChannelCategory category) {
        return CreatorApplicationDTO.builder()
                .channelName(channelName)
                .channelDescription(channelDescription)
                .category(category)
                .build();
    }
}
