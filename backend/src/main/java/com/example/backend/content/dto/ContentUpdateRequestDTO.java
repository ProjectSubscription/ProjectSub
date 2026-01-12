package com.example.backend.content.dto;

import com.example.backend.content.entity.AccessType;
import com.example.backend.content.entity.ContentType;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ContentUpdateRequestDTO {
    private String title;
    private ContentType contentType;
    private AccessType accessType;
    private Integer previewRatio;
    private String body;
    private String mediaUrl;
    private Integer price;
    private LocalDateTime publishedAt;
}
