package com.example.backend.channel.service;

import com.example.backend.channel.dto.request.ChannelCreateRequest;
import com.example.backend.channel.dto.request.ChannelUpdateRequest;
import com.example.backend.channel.dto.response.ChannelDetailResponse;
import com.example.backend.channel.dto.response.ChannelListResponse;
import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.entity.ChannelCategory;
import com.example.backend.channel.repository.ChannelRepository;
import com.example.backend.channel.validator.ChannelValidator;
import com.example.backend.creator.entity.Creator;
import com.example.backend.creator.repository.CreatorRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.subscription.entity.SubscriptionStatus;
import com.example.backend.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ChannelServiceImpl implements ChannelService {

    private final ChannelRepository channelRepository;
    private final ChannelValidator channelValidator;
    private final SubscriptionRepository subscriptionRepository;
    private final CreatorRepository creatorRepository;

    //채널 생성
    @Override
    public void createChannel(Long creatorId, ChannelCreateRequest request) {
        if (creatorId == null || request == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        if (request.getTitle() == null || request.getCategory() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        if (channelRepository.findOneByCreatorId(creatorId).isPresent()) {
            throw new BusinessException(ErrorCode.CHANNEL_ALREADY_EXISTS);
        }

        Channel channel = Channel.create(
                creatorId,
                request.getTitle(),
                request.getDescription(),
                request.getThumbnailUrl(),
                request.getCategory()
        );

        channelRepository.save(channel);
    }

    //채널 수정
    @Override
    public void updateChannel(Long channelId, Long creatorId, ChannelUpdateRequest request) {
        if (channelId == null || creatorId == null || request == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        if (request.getTitle() == null || request.getCategory() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        channelValidator.validateOwner(creatorId, channelId);

        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));

        if (!channel.isActive()) {
            throw new BusinessException(ErrorCode.CHANNEL_INACTIVE);
        }

        channel.update(
                request.getTitle(),
                request.getDescription(),
                request.getThumbnailUrl(),
                request.getCategory()
        );
    }

    @Override
    public String updateChannelThumbnail(Long channelId, Long creatorId, MultipartFile file) {
        if (channelId == null || creatorId == null || file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        channelValidator.validateOwner(creatorId, channelId);

        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));

        if (!channel.isActive()) {
            throw new BusinessException(ErrorCode.CHANNEL_INACTIVE);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        String normalizedExtension = extension.toLowerCase();
        String contentType = file.getContentType();
        boolean isImageContentType = contentType != null && contentType.startsWith("image/");
        boolean isAllowedExtension = normalizedExtension.matches("\\.(jpg|jpeg|png|gif|webp|svg|heic|heif)");
        if (!isImageContentType && !isAllowedExtension) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        String fileName = "channel-" + channelId + "-" + UUID.randomUUID() + extension;
        Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "channels")
                .toAbsolutePath();
        try {
            Files.createDirectories(uploadDir);
            Path targetPath = uploadDir.resolve(fileName);
            file.transferTo(targetPath);
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        String storedUrl = "/uploads/channels/" + fileName;
        String resolvedUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(storedUrl)
                .toUriString();
        channel.updateThumbnail(resolvedUrl);
        return resolvedUrl;
    }

    //채널 비활성화
    @Override
    public void deactivateChannel(Long channelId, Long creatorId) {
        if (channelId == null || creatorId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        channelValidator.validateOwner(creatorId, channelId);

        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));

        if (!channel.isActive()) {
            throw new BusinessException(ErrorCode.CHANNEL_INACTIVE);
        }

        channel.deactivate();
    }

    //내 채널 조회
    @Override
    @Transactional(readOnly = true)
    public Channel getMyChannel(Long creatorId) {
        if (creatorId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        return channelRepository.findOneByCreatorId(creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));
    }

    //채널 상세 조회 (channelId 기준)
    @Override
    @Transactional(readOnly = true)
    public ChannelDetailResponse getChannelDetail(Long channelId, Long memberId) {
        if (channelId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));

        if (!channel.isActive()) {
            throw new BusinessException(ErrorCode.CHANNEL_INACTIVE);
        }

        boolean subscribed = memberId != null &&
                subscriptionRepository.existsByMemberIdAndChannelIdAndStatus(
                        memberId,
                        channelId,
                        SubscriptionStatus.ACTIVE
                );

        int subscriberCount = subscriptionRepository
                .findByChannelIdAndStatus(channelId, SubscriptionStatus.ACTIVE)
                .size();

        Creator creator = creatorRepository.findById(channel.getCreatorId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CREATOR_NOT_FOUND));

        return new ChannelDetailResponse(
                creator.getId(),
                creator.getMember().getNickname(),
                channel.getTitle(),
                channel.getDescription(),
                channel.getThumbnailUrl(),
                subscriberCount,
                subscribed
        );
    }

    //채널 상세 조회 (creatorId + memberId 기준 )
    @Override
    @Transactional(readOnly = true)
    public ChannelDetailResponse getChannelByCreator(Long creatorId, Long memberId) {
        if (creatorId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        Channel channel = channelRepository.findOneByCreatorId(creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));

        if (!channel.isActive()) {
            throw new BusinessException(ErrorCode.CHANNEL_INACTIVE);
        }

        boolean subscribed = memberId != null &&
                subscriptionRepository.existsByMemberIdAndChannelIdAndStatus(
                        memberId,
                        channel.getId(),
                        SubscriptionStatus.ACTIVE
                );

        int subscriberCount = subscriptionRepository
                .findByChannelIdAndStatus(channel.getId(), SubscriptionStatus.ACTIVE)
                .size();

        Creator creator = creatorRepository.findById(channel.getCreatorId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CREATOR_NOT_FOUND));

        return new ChannelDetailResponse(
                creator.getId(),
                creator.getMember().getNickname(),
                channel.getTitle(),
                channel.getDescription(),
                channel.getThumbnailUrl(),
                subscriberCount,
                subscribed
        );
    }

    //채널 엔티티 조회 (creatorId 이용)
    @Override
    @Transactional(readOnly = true)
    public Channel getChannelByCreatorId(Long creatorId) {
        if (creatorId == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        return channelRepository.findOneByCreatorId(creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHANNEL_NOT_FOUND));
    }

    // 채널 목록 조회
    @Override
    @Transactional(readOnly = true)
    public Page<ChannelListResponse> getChannelList(ChannelCategory category, Pageable pageable) {
        if (pageable == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        Page<Channel> channels;
        boolean isPopularSort = pageable.getSort().getOrderFor("subscriberCount") != null;

        if (isPopularSort) {
            Pageable noSortPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
            channels = channelRepository.findActiveChannelsOrderBySubscriberCount(
                    category,
                    SubscriptionStatus.ACTIVE,
                    noSortPageable
            );
        } else if (category == null) {
            channels = channelRepository.findByIsActiveTrue(pageable);
        } else {
            channels = channelRepository.findByCategoryAndIsActiveTrue(category, pageable);
        }

        return channels.map(channel ->
                new ChannelListResponse(
                        channel.getId(),
                        channel.getTitle(),
                        channel.getDescription(),
                        channel.getThumbnailUrl(),
                        channel.getCategory(),
                        channel.getSubscriberCount()
                )
        );
    }
}