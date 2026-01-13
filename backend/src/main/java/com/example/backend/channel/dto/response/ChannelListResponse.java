package com.example.backend.channel.dto.response;

import com.example.backend.channel.entity.ChannelCategory;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChannelListResponse {

    private Long channelId;
    private String title;
    private String description;
    private ChannelCategory category;
    private int subscriberCount;
}