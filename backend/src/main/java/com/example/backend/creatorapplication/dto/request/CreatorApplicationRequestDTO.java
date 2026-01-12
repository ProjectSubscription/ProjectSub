package com.example.backend.creatorapplication.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CreatorApplicationRequestDTO {
    @NotBlank(message = "채널명은 필수로 입력해야 합니다.")
    private String channelName;

    @NotBlank(message = "채널 설명은 필수로 입력해야 합니다.")
    private String channelDescription;

}
