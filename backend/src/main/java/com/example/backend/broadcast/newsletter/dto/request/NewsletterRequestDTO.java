package com.example.backend.broadcast.newsletter.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class NewsletterRequestDTO {

    @NotBlank(message = "제목은 필수로 입력해야합니다.")
    private String title;

    @NotBlank(message = "내용은 필수로 입력해야합니다.")
    private String content;
}
