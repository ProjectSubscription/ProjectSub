package com.example.backend.channel.service;

import com.example.backend.channel.dto.request.ChannelCreateRequest;
import com.example.backend.channel.dto.request.ChannelUpdateRequest;
import com.example.backend.channel.dto.response.ChannelDetailResponse;
import com.example.backend.channel.dto.response.ChannelListResponse;
import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.entity.ChannelCategory;
import com.example.backend.channel.repository.ChannelRepository;
import com.example.backend.channel.validator.ChannelValidator;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.subscription.entity.SubscriptionStatus;
import com.example.backend.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ChannelServiceImpl implements ChannelService {

    private final ChannelRepository channelRepository;
    private final ChannelValidator channelValidator;
    private final SubscriptionRepository subscriptionRepository;

    //채널 생성
    @Override
    public void createChannel(Long creatorId, ChannelCreateRequest request) {
        if (channelRepository.findOneByCreatorId(creatorId).isPresent()) {
            throw new BusinessException(ErrorCode.CHANNEL_ALREADY_EXISTS);
        }

        Channel channel = Channel.create(
                creatorId,
                request.getTitle(),
                request.getDescription(),
                request.getCategory()
        );
        channelRepository.save(channel);
    }

    //채널 수정
    @Override
    public void updateChannel(
            Long channelId,
            Long creatorId,
            ChannelUpdateRequest request
    ) {
        channelValidator.validateOwner(creatorId, channelId);

        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));

        channel.update(
                request.getTitle(),
                request.getDescription(),
                request.getCategory()
        );
    }

    //채널 비활성화
    @Override
    public void deactivateChannel(Long channelId, Long creatorId) {
        channelValidator.validateOwner(creatorId, channelId);

        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));

        channel.deactivate();
    }

    //내 채널 조회
    @Override
    @Transactional(readOnly = true)
    public Channel getMyChannel(Long creatorId) {
        return channelRepository.findOneByCreatorId(creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));
    }

    //채널 상세 조회 (channelId 기준)
    @Override
    @Transactional(readOnly = true)
    public ChannelDetailResponse getChannelDetail(
            Long channelId,
            Long memberId
    ) {
        Channel channel = channelRepository.findByIdAndIsActiveTrue(channelId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));

        boolean subscribed = memberId != null &&
                subscriptionRepository.existsByMemberIdAndChannelIdAndStatus(
                        memberId,
                        channelId,
                        SubscriptionStatus.ACTIVE
                );

        int subscriberCount =
                subscriptionRepository
                        .findByChannelIdAndStatus(channelId, SubscriptionStatus.ACTIVE)
                        .size();

        return new ChannelDetailResponse(
                channel.getTitle(),
                channel.getDescription(),
                subscriberCount,
                subscribed
        );
    }

    //채널 상세 조회 (creatorId + memberId 기준 )
    @Override
    @Transactional(readOnly = true)
    public ChannelDetailResponse getChannelByCreator(
            Long creatorId,
            Long memberId
    ) {
        Channel channel = channelRepository.findOneByCreatorId(creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));

        boolean subscribed = memberId != null &&
                subscriptionRepository.existsByMemberIdAndChannelIdAndStatus(
                        memberId,
                        channel.getId(),
                        SubscriptionStatus.ACTIVE
                );

        int subscriberCount =
                subscriptionRepository
                        .findByChannelIdAndStatus(channel.getId(), SubscriptionStatus.ACTIVE)
                        .size();

        return new ChannelDetailResponse(
                channel.getTitle(),
                channel.getDescription(),
                subscriberCount,
                subscribed
        );
    }

    //채널 엔티티 조회 (creatorId 이용)
    @Override
    @Transactional(readOnly = true)
    public Channel getChannelByCreatorId(Long creatorId) {
        return channelRepository.findOneByCreatorId(creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));
    }

    // 채널 목록 조회
    @Override
    @Transactional(readOnly = true)
    public Page<ChannelListResponse> getChannelList(
            ChannelCategory category,
            Pageable pageable
    ) {
        Page<Channel> channels;

        if (category == null) {
            channels = channelRepository.findByIsActiveTrue(pageable);
        } else {
            channels = channelRepository.findByCategoryAndIsActiveTrue(category, pageable);
        }

        return channels.map(channel ->
                new ChannelListResponse(
                        channel.getId(),
                        channel.getTitle(),
                        channel.getDescription(),
                        channel.getCategory(),
                        channel.getSubscriberCount()
                )
        );
    }
}