package com.example.backend.channel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChannelDetailResponse {

    private String channelName;
    private String channelDescription;
    private String thumbnailUrl;
    private int subscriberCount;
    private boolean subscribed;
}