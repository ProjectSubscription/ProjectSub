package com.example.backend.member.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MemberRequest {

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;

    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다")
    //nullable (oauth 가입멤버 null)
    private String password;

    @NotBlank(message = "닉네임은 필수입니다")
    private String nickname;

    //nullable (일반 가입멤버 null)
    private String oauthProvider;

    //nullable
    @Min(value = 1900, message = "올바른 출생년도를 입력하세요")
    @Max(value = 2026, message = "올바른 출생년도를 입력하세요")
    private Integer birthYear;
}
