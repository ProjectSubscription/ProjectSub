package com.example.backend.member.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BirthYearRequest {

    @NotNull(message = "생년은 필수입니다")
    @Min(value = 1900, message = "올바른 출생년도를 입력하세요")
    @Max(value = 2026, message = "올바른 출생년도를 입력하세요")
    private Integer birthYear;

}
