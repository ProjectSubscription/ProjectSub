package com.example.backend.channel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChannelDetailResponse {

    private Long creatorId;
    private String creatorName;
    private String channelName;
    private String channelDescription;
    private String thumbnailUrl;
    private int subscriberCount;
    private boolean subscribed;
}