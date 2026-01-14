package com.example.backend.member.dto.request;

import com.example.backend.member.entity.Gender;
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

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다")
    private String password;

    @NotBlank(message = "닉네임은 필수입니다")
    private String nickname;

    //nullable
    @Min(value = 1900, message = "올바른 출생년도를 입력하세요")
    @Max(value = 2026, message = "올바른 출생년도를 입력하세요")
    private Integer birthYear;

    @NotNull(message = "성별을 선택해주세요")
    private Gender gender;
}
