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
public class CreatorApplicationDetailResponseDTO {
    private Long applicationId;
    private String nickname;
    private String email;
    private String channelName;
    private String channelDescription;
    private LocalDateTime createdAt;
    private ApprovalStatus status;
    private String rejectReason;

    public static CreatorApplicationDetailResponseDTO create(CreatorApplication creatorApplication) {
        return CreatorApplicationDetailResponseDTO.builder()
                .applicationId(creatorApplication.getId())
                .nickname(creatorApplication.getMember().getNickname())
                .email(creatorApplication.getMember().getEmail())
                .channelName(creatorApplication.getChannelName())
                .channelDescription(creatorApplication.getChannelDescription())
                .createdAt(creatorApplication.getCreatedAt())
                .status(creatorApplication.getStatus())
                .rejectReason(creatorApplication.getRejectReason())
                .build();
    }
}
