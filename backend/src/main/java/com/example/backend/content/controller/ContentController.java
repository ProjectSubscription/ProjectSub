package com.example.backend.content.controller;

import com.example.backend.content.dto.ContentCreateRequestDTO;
import com.example.backend.content.dto.ContentListResponseDTO;
import com.example.backend.content.dto.ContentResponseDTO;
import com.example.backend.content.dto.ContentUpdateRequestDTO;
import com.example.backend.content.entity.AccessType;
import com.example.backend.content.entity.ContentType;
import com.example.backend.content.service.ContentService;
import com.example.backend.global.security.CustomUserDetails;
import com.example.backend.member.entity.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    /**
     * 콘텐츠 등록 (임시저장)
     * POST /api/contents
     * 권한: 크리에이터 (CREATOR)
     */
    @PostMapping
    public ResponseEntity<ContentResponseDTO> createContent(
            @Valid @RequestBody ContentCreateRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        // 크리에이터 권한 확인
        if (userDetails == null || !userDetails.getRoles().contains(Role.ROLE_CREATOR)) {
            throw new IllegalArgumentException("크리에이터 권한이 필요합니다.");
        }

        ContentResponseDTO response = contentService.createContent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 콘텐츠 즉시 발행
     * POST /api/contents/publish
     * 권한: 크리에이터 (CREATOR)
     */
    @PostMapping("/publish")
    public ResponseEntity<ContentResponseDTO> publishContentImmediately(
            @Valid @RequestBody ContentCreateRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        // 크리에이터 권한 확인
        if (userDetails == null || !userDetails.getRoles().contains(Role.ROLE_CREATOR)) {
            throw new IllegalArgumentException("크리에이터 권한이 필요합니다.");
        }

        ContentResponseDTO response = contentService.publishContentImmediately(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 콘텐츠 예약 발행
     * POST /api/contents/schedule
     * 권한: 크리에이터 (CREATOR)
     */
    @PostMapping("/schedule")
    public ResponseEntity<ContentResponseDTO> scheduleContentPublish(
            @Valid @RequestBody ContentCreateRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        // 크리에이터 권한 확인
        if (userDetails == null || !userDetails.getRoles().contains(Role.ROLE_CREATOR)) {
            throw new IllegalArgumentException("크리에이터 권한이 필요합니다.");
        }

        ContentResponseDTO response = contentService.scheduleContentPublish(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 콘텐츠 수정
     * PUT /api/contents/{id}
     * 권한: 크리에이터 (CREATOR)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ContentResponseDTO> updateContent(
            @PathVariable Long id,
            @RequestBody ContentUpdateRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        // 크리에이터 권한 확인
        if (userDetails == null || !userDetails.getRoles().contains(Role.ROLE_CREATOR)) {
            throw new IllegalArgumentException("크리에이터 권한이 필요합니다.");
        }

        ContentResponseDTO response = contentService.updateContent(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 콘텐츠 삭제 (Soft Delete)
     * DELETE /api/contents/{id}
     * 권한: 크리에이터 (CREATOR)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        // 크리에이터 권한 확인
        if (userDetails == null || !userDetails.getRoles().contains(Role.ROLE_CREATOR)) {
            throw new IllegalArgumentException("크리에이터 권한이 필요합니다.");
        }

        contentService.deleteContent(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 콘텐츠 상세 조회
     * GET /api/contents/{id}
     * 권한: 비회원, 일반유저, 크리에이터, 관리자 (접근권한에 따라 제한)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ContentResponseDTO> getContent(
            @PathVariable Long id,
            @AuthenticationPrincipal(required = false) CustomUserDetails userDetails
    ) {
        String userRole = null;
        Long userId = null;
        
        if (userDetails != null) {
            // Role을 String으로 변환 (기존 로직과 호환성을 위해)
            if (userDetails.getRoles().contains(Role.ROLE_ADMIN)) {
                userRole = "ADMIN";
            } else if (userDetails.getRoles().contains(Role.ROLE_CREATOR)) {
                userRole = "CREATOR";
            } else if (userDetails.getRoles().contains(Role.ROLE_USER)) {
                userRole = "USER";
            }
            userId = userDetails.getMemberId();
        }
        
        ContentResponseDTO response = contentService.getContentById(id, userRole, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 콘텐츠 목록 조회
     * GET /api/contents
     * 권한: 비회원, 일반유저, 크리에이터, 관리자
     * query 파라미터: channelId, contentType, accessType, page, size, sort
     */
    @GetMapping
    public ResponseEntity<Page<ContentListResponseDTO>> getContentList(
            @RequestParam(required = false) Long channelId,
            @RequestParam(required = false) ContentType contentType,
            @RequestParam(required = false) AccessType accessType,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ContentListResponseDTO> response = contentService.getContentList(
                channelId,
                contentType,
                accessType,
                pageable
        );
        return ResponseEntity.ok(response);
    }

    /**
     * 채널의 대표 콘텐츠 3개 조회 (조회수 높은 순)
     * GET /api/contents/channels/{channelId}/featured
     * 권한: 비회원, 일반유저, 크리에이터, 관리자
     */
    @GetMapping("/channels/{channelId}/featured")
    public ResponseEntity<List<ContentListResponseDTO>> getFeaturedContentsByChannelId(
            @PathVariable Long channelId
    ) {
        List<ContentListResponseDTO> response = contentService.getFeaturedContentsByChannelId(channelId);
        return ResponseEntity.ok(response);
    }

    /**
     * 크리에이터별 총 콘텐츠 수 조회
     * GET /api/contents/creators/{creatorId}/statistics/total-count
     * 권한: 비회원, 일반유저, 크리에이터, 관리자
     */
    @GetMapping("/creators/{creatorId}/statistics/total-count")
    public ResponseEntity<Long> getTotalContentCountByCreatorId(
            @PathVariable Long creatorId
    ) {
        long count = contentService.getTotalContentCountByCreatorId(creatorId);
        return ResponseEntity.ok(count);
    }

    /**
     * 크리에이터별 총 조회수 조회
     * GET /api/contents/creators/{creatorId}/statistics/total-views
     * 권한: 비회원, 일반유저, 크리에이터, 관리자
     */
    @GetMapping("/creators/{creatorId}/statistics/total-views")
    public ResponseEntity<Long> getTotalViewCountByCreatorId(
            @PathVariable Long creatorId
    ) {
        long totalViews = contentService.getTotalViewCountByCreatorId(creatorId);
        return ResponseEntity.ok(totalViews);
    }

    /**
     * 크리에이터별 최근 5일간 발행된 콘텐츠 개수 조회
     * GET /api/contents/creators/{creatorId}/statistics/recent-published
     * 권한: 비회원, 일반유저, 크리에이터, 관리자
     */
    @GetMapping("/creators/{creatorId}/statistics/recent-published")
    public ResponseEntity<Long> getRecentPublishedContentCountByCreatorId(
            @PathVariable Long creatorId
    ) {
        long count = contentService.getRecentPublishedContentCountByCreatorId(creatorId);
        return ResponseEntity.ok(count);
    }
}
