package com.example.backend.member.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class NicknameChangeRequest {

    @NotBlank(message = "닉네임은 필수입니다")
    private String newNickname;
}
