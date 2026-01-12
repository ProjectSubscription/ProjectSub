package com.example.backend.creatorapplication.controller;

import com.example.backend.creatorapplication.dto.request.ApprovalRequestDTO;
import com.example.backend.creatorapplication.dto.request.CreatorApplicationRequestDTO;
import com.example.backend.creatorapplication.dto.response.AllCreatorApplicationResponseDTO;
import com.example.backend.creatorapplication.dto.response.CreatorAppSuccessResponseDTO;
import com.example.backend.creatorapplication.dto.response.CreatorApplicationDetailResponseDTO;
import com.example.backend.creatorapplication.dto.response.MyCreatorApplicationResponseDTO;
import com.example.backend.creatorapplication.service.CreatorApplicationService;
import com.example.backend.member.entity.Member;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Slf4j
public class CreatorApplicationController {

    private final CreatorApplicationService creatorApplicationService;

    // 크리에이터 신청
    @PostMapping("/creators/applications")
    public ResponseEntity<CreatorAppSuccessResponseDTO> createApp(@AuthenticationPrincipal Principal principal,
                                        @Valid @RequestBody CreatorApplicationRequestDTO dto) {
        Long memberId = null;
        // Long memberId = ((CustomUserDetails) principal).getId();

        log.info("크리에이터 신청 생성 요청 - memberId={}",memberId);

        CreatorAppSuccessResponseDTO response =  creatorApplicationService.createApplication(memberId, dto);

        log.info("크리에이터 신청 생성 응답 - response={}", response);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 내 신청 이력 조회
    @GetMapping("/creators/applications/me")
    public ResponseEntity<Page<MyCreatorApplicationResponseDTO>> getMyApps(@AuthenticationPrincipal Principal principal,
                                                                           @PageableDefault(
                                                                                   sort = "createdAt",
                                                                                   direction = Sort.Direction.DESC) Pageable pageable) {
        Long memberId = null;
        // Long memberId = ((CustomUserDetails) principal).getId();

        log.info("크리에이터 신청이력 조회 요청 - memberId={}", memberId);

        Page<MyCreatorApplicationResponseDTO> applications = creatorApplicationService.getMyApplications(memberId, pageable);

        log.info("크리에이터 신청이력 조회 응답 - applications={}", applications);

        return ResponseEntity.ok(applications);
    }

    // 관리자가 모든 신청 이력 조회
    @GetMapping("/admin/creators/applications")
    public ResponseEntity<Page<AllCreatorApplicationResponseDTO>> getApps(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<AllCreatorApplicationResponseDTO> applications = creatorApplicationService.getApplications(pageable);

        log.info("크리에이터 모든 신청이력 조회 응답 - applications={}", applications);

        return ResponseEntity.ok(applications);
    }

    // 신청 승인 / 반려
    @PostMapping("/admin/creators/applications/{applicationId}")
    public ResponseEntity<MyCreatorApplicationResponseDTO> approvalApp(@PathVariable Long applicationId,
                                                                       @RequestBody ApprovalRequestDTO approvalRequestDTO) {

        log.info("크리에이터 승인 요청 - applicationId={}", applicationId);

        MyCreatorApplicationResponseDTO creatorApplicationResponseDTO =
                creatorApplicationService.approvalApplication(applicationId, approvalRequestDTO);

        log.info("크리에이터 승인 응답 - app dto={}", creatorApplicationResponseDTO);

        return ResponseEntity.ok(creatorApplicationResponseDTO);
    }

    // 신청 상세보기 - 회원, 관리자
    @GetMapping("/creators/applications/{applicationId}")
    public ResponseEntity<CreatorApplicationDetailResponseDTO> getAppDetail(@AuthenticationPrincipal Principal principal,
                                                                            @PathVariable Long applicationId) {

        Long memberId = null;
        // Long memberId = ((CustomUserDetails) principal).getId();

        log.info("크리에이터 신청 상세조회 - applicationId={}", applicationId);

        CreatorApplicationDetailResponseDTO appDetail = creatorApplicationService.getAppDetail(memberId, applicationId);

        log.info("크리에이터 신청 상세조회 - appDetail={}", appDetail);

        return ResponseEntity.ok(appDetail);
    }
}
