package com.example.backend.creatorapplication.dto.response;

import com.example.backend.creatorapplication.entity.ApprovalStatus;
import com.example.backend.creatorapplication.entity.CreatorApplication;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class MyCreatorApplicationResponseDTO {
    private Long applicationId;
    private String channelName;
    private ApprovalStatus status;
    private LocalDateTime createdAt;

    public static MyCreatorApplicationResponseDTO create(CreatorApplication application) {
        return builder()
                .applicationId(application.getId())
                .channelName(application.getChannelName())
                .status(application.getStatus())
                .createdAt(application.getCreatedAt())
                .build();
    }
}
