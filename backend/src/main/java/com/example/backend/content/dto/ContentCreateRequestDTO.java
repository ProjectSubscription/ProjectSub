package com.example.backend.content.dto;

import com.example.backend.content.entity.AccessType;
import com.example.backend.content.entity.ContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ContentCreateRequestDTO {
    @NotNull
    private Long channelId;

    @NotBlank
    private String title;

    @NotNull
    private ContentType contentType;

    @NotNull
    private AccessType accessType;

    private Integer previewRatio;

    private String body;

    private String mediaUrl;

    @NotNull
    private Integer price;

    private LocalDateTime publishedAt;
}
