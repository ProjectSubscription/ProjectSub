package com.example.backend.creatorapplication.dto.response;

import com.example.backend.channel.entity.ChannelCategory;
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
public class AllCreatorApplicationResponseDTO {
    private Long applicationId;
    private String nickname;
    private String channelName;
    private ChannelCategory channelCategory;
    private ApprovalStatus status;
    private LocalDateTime createdAt;

    public static AllCreatorApplicationResponseDTO create(CreatorApplication application) {
        return builder()
                .applicationId(application.getId())
                .nickname(application.getMember().getNickname()) /// n+1 : fetch join 필요
                .channelName(application.getChannelName())
                .channelCategory(application.getChannelCategory())
                .status(application.getStatus())
                .createdAt(application.getCreatedAt())
                .build();
    }
}
