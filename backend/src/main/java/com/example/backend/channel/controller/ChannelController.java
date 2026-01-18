package com.example.backend.channel.controller;

import com.example.backend.channel.dto.request.ChannelCreateRequest;
import com.example.backend.channel.dto.request.ChannelUpdateRequest;
import com.example.backend.channel.dto.response.ChannelDetailResponse;
import com.example.backend.channel.dto.response.ChannelListResponse;
import com.example.backend.channel.dto.response.ChannelThumbnailResponse;
import com.example.backend.channel.dto.response.MyChannelResponse;
import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.entity.ChannelCategory;
import com.example.backend.channel.service.ChannelService;
import com.example.backend.creator.entity.Creator;
import com.example.backend.creator.repository.CreatorRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.global.security.CustomUserDetails;
import com.example.backend.member.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/channels")
public class ChannelController {

    private final ChannelService channelService;
    private final CreatorRepository creatorRepository;

    /**
     * 채널 생성
     * POST /api/channels
     * 권한: 크리에이터
     */
    @PostMapping
    public void createChannel(
            @RequestParam(required = false) Long creatorId,
            @RequestBody ChannelCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long resolvedCreatorId = resolveCreatorIdForWrite(userDetails, creatorId);
        channelService.createChannel(resolvedCreatorId, request);
    }

    /**
     * 채널 수정
     * PUT /api/channels/{id}
     * 권한: 크리에이터(본인 채널)
     */
    @PutMapping("/{channelId}")
    public void updateChannel(
            @PathVariable Long channelId,
            @RequestParam(required = false) Long creatorId,
            @RequestBody ChannelUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long resolvedCreatorId = resolveCreatorIdForWrite(userDetails, creatorId);
        channelService.updateChannel(channelId, resolvedCreatorId, request);
    }

    /**
     * 채널 이미지 업로드
     * POST /api/channels/{id}/thumbnail
     * 권한: 크리에이터(본인 채널)
     */
    @PostMapping(value = "/{channelId}/thumbnail", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ChannelThumbnailResponse uploadThumbnail(
            @PathVariable Long channelId,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long resolvedCreatorId = resolveCreatorIdForWrite(userDetails, null);
        String thumbnailUrl = channelService.updateChannelThumbnail(channelId, resolvedCreatorId, file);
        return new ChannelThumbnailResponse(thumbnailUrl);
    }

    /**
     * 채널 비활성화
     * DELETE /api/channels/{id}
     * 권한: 크리에이터(본인 채널)
     * 설명: 채널을 삭제하지 않고 isActive=false 처리
     */
    @DeleteMapping("/{channelId}")
    public void deactivateChannel(
            @PathVariable Long channelId,
            @RequestParam(required = false) Long creatorId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        Long resolvedCreatorId = resolveCreatorIdForWrite(userDetails, creatorId);
        channelService.deactivateChannel(channelId, resolvedCreatorId);
    }

    /**
     * 채널 상세 조회
     * GET /api/channels/{id}
     * 권한: 관리자, 비회원, 유저, 판매자
     * 설명: 채널 정보 + 구독자 수 + (로그인 시) 내 구독 여부
     */
    @GetMapping("/{channelId}")
    public ChannelDetailResponse getChannelDetail(
            @PathVariable Long channelId,
            @RequestParam(required = false) Long memberId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        // 보안상 memberId 파라미터는 신뢰하지 않고, 로그인한 사용자 기준으로만 구독 여부를 계산한다.
        Long resolvedMemberId = (userDetails != null) ? userDetails.getMemberId() : null;
        return channelService.getChannelDetail(channelId, resolvedMemberId);
    }


    /**
     * 크리에이터 본인 채널 조회
     * GET /api/channels/my
     * 권한: 판매자(크리에이터)
     * 설명: 크리에이터 마이페이지 - 채널 관리 탭 용도
     */
    @GetMapping("/my")
    public MyChannelResponse getMyChannel(
            @RequestParam(required = false) Long creatorId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long resolvedCreatorId = resolveCreatorIdForWrite(userDetails, creatorId);
        Channel channel = channelService.getMyChannel(resolvedCreatorId);

        return new MyChannelResponse(
                channel.getId(),
                channel.getTitle(),
                channel.getDescription(),
                channel.getThumbnailUrl(),
                channel.getCategory(),
                channel.getSubscriberCount(),
                channel.isActive()
        );
    }

    /**
     * 크리에이터 기준 채널 조회
     * GET /api/channels/creator/{creatorId}
     * 권한: 관리자, 비회원, 유저, 판매자
     * 설명: 특정 크리에이터의 채널 정보 조회
     */
    @GetMapping("/creator/{creatorId}")
    public ChannelDetailResponse getChannelByCreator(
            @PathVariable Long creatorId,
            @RequestParam(required = false) Long memberId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long resolvedMemberId = (userDetails != null) ? userDetails.getMemberId() : null;
        return channelService.getChannelByCreator(creatorId, resolvedMemberId);
    }

    /**
     * 채널 목록 조회
     * GET /api/channels
     * 권한: 관리자, 비회원, 유저, 판매자
     * query: category, page, size
     */
    @GetMapping
    public Page<ChannelListResponse> getChannels(
            @RequestParam(required = false) ChannelCategory category,
            @RequestParam(required = false) String sort,
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        Pageable resolvedPageable = applySort(pageable, sort);
        return channelService.getChannelList(category, resolvedPageable);
    }

    private Pageable applySort(Pageable pageable, String sort) {
        // 인기/신규
        String normalized = (sort == null) ? "new" : sort.trim().toLowerCase();

        Sort resolvedSort;
        if ("popular".equals(normalized)) {
            resolvedSort = Sort.by(Sort.Direction.DESC, "subscriberCount");
        } else {
            // new (default)
            resolvedSort = Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), resolvedSort);
    }


    /**
     * 채널 쓰기 작업에서 creatorId를 안전하게 결정
     * 로그인한 사용자(memberId)로 Creator를 조회하여 creatorId로 사용
     */
    private Long resolveCreatorIdForWrite(CustomUserDetails userDetails, Long creatorIdParam) {
        if (userDetails == null) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        if (userDetails.getRoles() == null || !userDetails.getRoles().contains(Role.ROLE_CREATOR)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        Creator creator = creatorRepository.findByMemberId(userDetails.getMemberId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CREATOR_NOT_FOUND));
        return creator.getId();
    }
}
