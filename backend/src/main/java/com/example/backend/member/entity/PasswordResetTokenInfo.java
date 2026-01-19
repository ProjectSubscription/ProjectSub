package com.example.backend.member.entity;

import lombok.Getter;


@Getter
public class PasswordResetTokenInfo {

    private Long memberId;  // 토큰의 주인

    //redis 역직렬화
    public PasswordResetTokenInfo() {
    }

    public PasswordResetTokenInfo(Long memberId) {
        this.memberId = memberId;
    }

}