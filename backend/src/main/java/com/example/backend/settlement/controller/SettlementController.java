package com.example.backend.settlement.controller;

import com.example.backend.creator.entity.Creator;
import com.example.backend.creator.repository.CreatorRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.global.security.CustomUserDetails;
import com.example.backend.settlement.dto.response.SettlementResponseDTO;
import com.example.backend.settlement.dto.response.SettlementStatisticsResponseDTO;
import com.example.backend.settlement.entity.SettlementStatus;
import com.example.backend.settlement.service.SettlementService;
import com.example.backend.member.entity.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class SettlementController {

    private final SettlementService settlementService;
    private final CreatorRepository creatorRepository;

    /**
     * 내 정산 목록 조회
     * GET /api/creators/me/settlements
     */
    @GetMapping("/creators/me/settlements")
    public ResponseEntity<List<SettlementResponseDTO>> getMySettlements(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        Long memberId = customUserDetails.getMemberId();

        log.info("내 정산 목록 조회 요청 - memberId: {}", memberId);

        // memberId로 creatorId 조회
        Long creatorId = creatorRepository.findByMemberId(memberId)
                .map(Creator::getId)
                .orElseThrow(() -> {
                    log.error("크리에이터를 찾을 수 없습니다. memberId: {}", memberId);
                    return new BusinessException(ErrorCode.CREATOR_NOT_FOUND);
                });

        List<SettlementResponseDTO> settlements = settlementService.getSettlementsByCreatorId(creatorId);

        log.info("내 정산 목록 조회 응답 - creatorId: {}, settlements count: {}", creatorId, settlements.size());

        return ResponseEntity.ok(settlements);
    }

    /**
     * 정산 상세 조회
     * GET /api/creators/me/settlements/{settlementId}
     */
    @GetMapping("/creators/me/settlements/{settlementId}")
    public ResponseEntity<SettlementResponseDTO> getSettlementDetail(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long settlementId
    ) {
        Long memberId = customUserDetails.getMemberId();

        log.info("정산 상세 조회 요청 - memberId: {}, settlementId: {}", memberId, settlementId);

        // memberId로 creatorId 조회
        Long creatorId = creatorRepository.findByMemberId(memberId)
                .map(Creator::getId)
                .orElseThrow(() -> {
                    log.error("크리에이터를 찾을 수 없습니다. memberId: {}", memberId);
                    return new BusinessException(ErrorCode.CREATOR_NOT_FOUND);
                });

        SettlementResponseDTO settlement = settlementService.getSettlementById(settlementId, creatorId);

        log.info("정산 상세 조회 응답 - creatorId: {}, settlementId: {}", creatorId, settlementId);

        return ResponseEntity.ok(settlement);
    }

    // ==================== 관리자 API ====================

    /**
     * 관리자용: 전체 정산 목록 조회
     * GET /api/admin/settlements
     */
    @GetMapping("/admin/settlements")
    public ResponseEntity<Page<SettlementResponseDTO>> getAllSettlements(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestParam(required = false) Long creatorId,
            @RequestParam(required = false) String creatorNickname,
            @RequestParam(required = false) String settlementPeriod,
            @RequestParam(required = false) SettlementStatus status,
            @PageableDefault(size = 20, sort = "settlementPeriod", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable
    ) {
        // 관리자 권한 확인
        if (customUserDetails == null || !customUserDetails.getRoles().contains(Role.ROLE_ADMIN)) {
            log.warn("관리자 권한이 없는 사용자가 정산 목록 조회 시도");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("관리자용 정산 목록 조회 요청 - creatorId: {}, creatorNickname: {}, settlementPeriod: {}, status: {}",
                creatorId, creatorNickname, settlementPeriod, status);

        Page<SettlementResponseDTO> settlements = settlementService.getAllSettlements(
                creatorId, creatorNickname, settlementPeriod, status, pageable
        );

        log.info("관리자용 정산 목록 조회 응답 - total: {}", settlements.getTotalElements());

        return ResponseEntity.ok(settlements);
    }

    /**
     * 관리자용: 정산 상세 조회
     * GET /api/admin/settlements/{settlementId}
     */
    @GetMapping("/admin/settlements/{settlementId}")
    public ResponseEntity<SettlementResponseDTO> getSettlementDetailForAdmin(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long settlementId
    ) {
        // 관리자 권한 확인
        if (customUserDetails == null || !customUserDetails.getRoles().contains(Role.ROLE_ADMIN)) {
            log.warn("관리자 권한이 없는 사용자가 정산 상세 조회 시도 - settlementId: {}", settlementId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("관리자용 정산 상세 조회 요청 - settlementId: {}", settlementId);

        SettlementResponseDTO settlement = settlementService.getSettlementByIdForAdmin(settlementId);

        log.info("관리자용 정산 상세 조회 응답 - settlementId: {}", settlementId);

        return ResponseEntity.ok(settlement);
    }

    /**
     * 관리자용: 정산 통계 조회
     * GET /api/admin/settlements/statistics
     */
    @GetMapping("/admin/settlements/statistics")
    public ResponseEntity<SettlementStatisticsResponseDTO> getSettlementStatistics(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        // 관리자 권한 확인
        if (customUserDetails == null || !customUserDetails.getRoles().contains(Role.ROLE_ADMIN)) {
            log.warn("관리자 권한이 없는 사용자가 정산 통계 조회 시도");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("정산 통계 조회 요청");

        SettlementStatisticsResponseDTO statistics = settlementService.getSettlementStatistics();

        log.info("정산 통계 조회 응답");

        return ResponseEntity.ok(statistics);
    }

    /**
     * 관리자용: 정산 재시도
     * POST /api/admin/settlements/{settlementId}/retry
     */
    @PostMapping("/admin/settlements/{settlementId}/retry")
    public ResponseEntity<Map<String, Object>> retrySettlement(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long settlementId
    ) {
        // 관리자 권한 확인
        if (customUserDetails == null || !customUserDetails.getRoles().contains(Role.ROLE_ADMIN)) {
            log.warn("관리자 권한이 없는 사용자가 정산 재시도 시도 - settlementId: {}", settlementId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("관리자용 정산 재시도 요청 - settlementId: {}", settlementId);

        boolean success = settlementService.retrySettlement(settlementId);

        log.info("관리자용 정산 재시도 응답 - settlementId: {}, success: {}", settlementId, success);

        return ResponseEntity.ok(Map.of(
                "success", success,
                "message", success ? "정산 재시도가 성공했습니다." : "정산 재시도가 실패했습니다."
        ));
    }
}

