package com.example.backend.channel.dto.request;

import com.example.backend.channel.entity.ChannelCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ChannelCreateRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    private ChannelCategory category;
}
