package com.example.backend.member.dto.request;

import com.example.backend.member.entity.Gender;
import jakarta.validation.constraints.*;
import lombok.Getter;

@Getter
public class CompleteOAuthProfileRequest {

    @NotBlank
    private String nickname;

    @NotNull
    private Gender gender;

    // email은 선택, 서비스에서 검증
    @Email
    private String email;

    @Min(value = 1900, message = "올바른 출생년도를 입력하세요")
    @Max(value = 2026, message = "올바른 출생년도를 입력하세요")
    private Integer birthYear;
}
