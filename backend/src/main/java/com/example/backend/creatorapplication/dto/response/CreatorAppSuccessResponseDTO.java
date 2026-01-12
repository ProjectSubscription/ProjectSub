package com.example.backend.creatorapplication.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class CreatorAppSuccessResponseDTO {
    private Long applicationId;
    private String message; // 신청 했을 때 반환 메시지

    public static CreatorAppSuccessResponseDTO create(Long applicationId) {
        return CreatorAppSuccessResponseDTO.builder()
                .applicationId(applicationId)
                .message("크리에이터 신청이 접수되었습니다. 관리자의 검토 후 승인여부를 확인할 수 있습니다.")
                .build();
    }
}
