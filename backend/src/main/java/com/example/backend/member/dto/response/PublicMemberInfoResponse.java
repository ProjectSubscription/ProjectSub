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
    //todo: 공개프로필에 성별이 추가되어야할지는 생각해봐야함.
    public static PublicMemberInfoResponse fromEntity(Member entity) {
        return PublicMemberInfoResponse.builder()
                .id(entity.getId())
                .nickname(entity.getNickname())
                .build();
    }

}
