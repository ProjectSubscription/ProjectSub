package com.example.backend.member.dto.response;

import com.example.backend.member.entity.Member;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
@Getter
public class PublicMemberInfoResponse {

    private Long id;
    private String nickname;

    public static PublicMemberInfoResponse fromEntity(Member entity) {
        return PublicMemberInfoResponse.builder()
                .id(entity.getId())
                .nickname(entity.getNickname())
                .build();
    }

}
