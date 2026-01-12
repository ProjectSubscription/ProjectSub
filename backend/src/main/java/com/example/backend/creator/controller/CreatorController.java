package com.example.backend.creator.controller;

import com.example.backend.creator.dto.response.CreatorMyPageResponseDTO;
import com.example.backend.creator.dto.response.CreatorResponseDTO;
import com.example.backend.creator.service.CreatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Slf4j
public class CreatorController {

    private final CreatorService creatorService;

    // 크리에이터 정보 조회
    // 닉네임, 소개글, 구독자 수, 구독하기 버튼, 채널 컨텐츠 목록
    @GetMapping("/creators/{creatorId}")
    public ResponseEntity<CreatorResponseDTO> creatorInfo(@AuthenticationPrincipal Principal principal,
                                        @PathVariable Long creatorId) {
        Long memberId = null;
        // Long memberId = ((CustomUserDetails) principal).getId();

        log.info("크리에이터 정보 조회 요청 - memberId={}", memberId);

        CreatorResponseDTO creatorInfo = creatorService.getCreatorInfo(memberId, creatorId);

        log.info("크리에이터 정보 조회 응답 - creatorInfo={}", creatorInfo);

        return ResponseEntity.ok(creatorInfo);
    }

    // 크리에이터 마이페이지
    // 대시보드, 정산관리, 컨텐츠 관리, 구독자 관리, 채널 설정 변경
    @GetMapping("/creators/me")
    public ResponseEntity<?> creatorMyPage(@AuthenticationPrincipal Principal principal) {

        Long memberId = null;
        // Long memberId = ((CustomUserDetails) principal).getId();

        CreatorMyPageResponseDTO myPage = creatorService.getCreatorMyPage(memberId);

        log.info("크리에이터 마이페이지 응답 - myPage={}", myPage);

        return ResponseEntity.ok(myPage);

    }
}
