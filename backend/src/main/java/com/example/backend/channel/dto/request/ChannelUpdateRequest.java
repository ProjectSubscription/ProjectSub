package com.example.backend.channel.dto.request;

import com.example.backend.channel.entity.ChannelCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ChannelUpdateRequest {

    @NotBlank
    private String title;

    private String description;

    private String thumbnailUrl;

    @NotNull
    private ChannelCategory category;
}