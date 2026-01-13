package com.example.backend.channel.service;

import com.example.backend.channel.dto.request.ChannelCreateRequest;
import com.example.backend.channel.dto.request.ChannelUpdateRequest;
import com.example.backend.channel.dto.response.ChannelDetailResponse;
import com.example.backend.channel.dto.response.ChannelListResponse;
import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.entity.ChannelCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface ChannelService {

    /**
     * 채널 생성
     *
     * - 사용자가 크리에이터로 전환되며 최초로 채널을 생성할 때 사용
     * - 사용자당 하나의 채널만 생성 가능하다는 비즈니스 규칙을 포함
     *
     * @param creatorId 채널을 생성하는 크리에이터의 ID
     * @param request   채널 생성에 필요한 정보
     */
    void createChannel(Long creatorId, ChannelCreateRequest request);

    /**
     * 채널 수정
     *
     * - 채널 소유자만 채널 정보를 수정할 수 있음
     * - 채널의 기본 정보를 변경할 때 사용
     *
     * @param channelId 수정 대상 채널 ID
     * @param creatorId 수정 요청을 하는 크리에이터 ID
     * @param request   수정할 채널 정보
     */
    void updateChannel(Long channelId, Long creatorId, ChannelUpdateRequest request);

    /**
     * 채널 비활성화
     *
     * - 채널을 DB에서 실제로 삭제하지 않고 비활성 상태로 전환
     * - 구독, 콘텐츠 등 연관 데이터 보호를 위한 설계
     *
     * @param channelId 비활성화할 채널 ID
     * @param creatorId 채널 소유자 ID
     */
    void deactivateChannel(Long channelId, Long creatorId);

    /**
     * 내 채널 조회
     *
     * - 로그인한 크리에이터가 본인의 채널을 관리하기 위해 사용하는 조회
     *
     * @param creatorId 크리에이터 ID
     * @return 크리에이터가 소유한 Channel 엔티티
     */
    Channel getMyChannel(Long creatorId);

    /**
     * 채널 상세 조회 (channelId 기준)
     *
     * - 일반 사용자가 채널을 클릭했을 때 사용하는 조회
     * - 채널 정보 + 구독 여부 + 구독자 수를 함께 제공
     *
     * @param channelId 조회할 채널 ID
     * @param memberId  현재 로그인한 사용자 ID
     * @return 사용자 관점의 채널 상세 정보
     */
    ChannelDetailResponse getChannelDetail(Long channelId, Long memberId);

    /**
     * 채널 상세 조회 (creatorId 기준)
     *
     * - creatorId를 기준으로 채널을 조회하는 사용자 관점 API
     * - 크리에이터 프로필 페이지에서 사용
     *
     * @param creatorId 채널을 소유한 크리에이터 ID
     * @param memberId  현재 로그인한 사용자 ID
     * @return 사용자 관점의 채널 상세 정보
     */
    ChannelDetailResponse getChannelByCreator(Long creatorId, Long memberId);

    /**
     * 채널 엔티티 조회
     *
     * - 다른 도메인에서 채널 엔티티가 필요할 때 사용
     * - UI 응답 목적이 아닌 비즈니스 로직 처리용
     *
     * @param creatorId 채널을 소유한 크리에이터 ID
     * @return Channel 엔티티
     */
    Channel getChannelByCreatorId(Long creatorId);

    /**
     * 채널 목록 조회
     *
     * - 사용자가 여러 채널을 탐색할 수 있도록 제공하는 기능
     *
     * @param category 조회할 채널 카테고리 (null이면 전체 조회)
     * @param pageable 페이징 정보
     * @return 채널 목록 페이지
     */
    Page<ChannelListResponse> getChannelList(
            ChannelCategory category,
            Pageable pageable
    );
}