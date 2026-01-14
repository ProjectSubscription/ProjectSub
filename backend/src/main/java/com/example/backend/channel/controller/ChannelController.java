package com.example.backend.channel.controller;

import com.example.backend.channel.dto.request.ChannelCreateRequest;
import com.example.backend.channel.dto.request.ChannelUpdateRequest;
import com.example.backend.channel.dto.response.ChannelDetailResponse;
import com.example.backend.channel.dto.response.MyChannelResponse;
import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.service.ChannelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.example.backend.channel.dto.response.ChannelListResponse;
import com.example.backend.channel.entity.ChannelCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/channels")
public class ChannelController {

    private final ChannelService channelService;

    /**
     * 채널 생성
     * POST /api/channels
     * 권한: 크리에이터
     */
    @PostMapping
    public void createChannel(
            @RequestParam Long creatorId,
            @RequestBody ChannelCreateRequest request
    ) {
        channelService.createChannel(creatorId, request);
    }

    /**
     * 채널 수정
     * PUT /api/channels/{id}
     * 권한: 크리에이터(본인 채널)
     */
    @PutMapping("/{channelId}")
    public void updateChannel(
            @PathVariable Long channelId,
            @RequestParam Long creatorId,
            @RequestBody ChannelUpdateRequest request
    ) {
        channelService.updateChannel(channelId, creatorId, request);
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
            @RequestParam Long creatorId
    ) {
        channelService.deactivateChannel(channelId, creatorId);
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
            @RequestParam(required = false) Long memberId
    ) {
        return channelService.getChannelDetail(channelId, memberId);
    }


    /**
     * 크리에이터 본인 채널 조회
     * GET /api/channels/my
     * 권한: 판매자(크리에이터)
     * 설명: 크리에이터 마이페이지 - 채널 관리 탭 용도
     */
    @GetMapping("/my")
    public MyChannelResponse getMyChannel(
            @RequestParam Long creatorId
    ) {
        Channel channel = channelService.getMyChannel(creatorId);

        return new MyChannelResponse(
                channel.getId(),
                channel.getTitle(),
                channel.getDescription(),
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
            @RequestParam(required = false) Long memberId
    ) {
        return channelService.getChannelByCreator(creatorId, memberId);
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
            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        return channelService.getChannelList(category, pageable);
    }
}