package com.example.backend.member.dto.response;

import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.Role;
import lombok.*;

import java.util.Set;

@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
@Getter
public class MyInfoResponse {

    private Long id;
    private String email;
    private String nickname;
    private Set<Role> roles;
    private Integer birthYear;

    public static MyInfoResponse fromEntity(Member entity) {
        return MyInfoResponse.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .nickname(entity.getNickname())
                .roles(entity.getRoles())
                .birthYear(entity.getBirthYear())
                .build();
    }
}
