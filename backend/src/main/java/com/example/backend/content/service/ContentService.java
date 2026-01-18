package com.example.backend.content.service;

import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.repository.ChannelRepository;
import com.example.backend.content.dto.ContentCreateRequestDTO;
import com.example.backend.content.dto.ContentListResponseDTO;
import com.example.backend.content.dto.ContentResponseDTO;
import com.example.backend.content.dto.ContentUpdateRequestDTO;
import com.example.backend.content.dto.event.ContentPublishedEvent;
import com.example.backend.content.entity.AccessType;
import com.example.backend.content.entity.Content;
import com.example.backend.content.entity.ContentType;
import com.example.backend.content.entity.ContentView;
import com.example.backend.content.repository.ContentLikeRepository;
import com.example.backend.content.repository.ContentRepository;
import com.example.backend.content.repository.ContentViewRepository;
import com.example.backend.order.entity.OrderStatus;
import com.example.backend.order.entity.OrderType;
import com.example.backend.order.repository.OrderRepository;
import com.example.backend.subscription.entity.SubscriptionStatus;
import com.example.backend.subscription.repository.SubscriptionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ContentService {

    private final ContentRepository contentRepository;
    private final ChannelRepository channelRepository;
    private final ContentLikeRepository contentLikeRepository;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final ContentViewRepository contentViewRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final OrderRepository orderRepository;

    /**
     * 콘텐츠 등록 (임시저장 - publishedAt이 null)
     */
    public ContentResponseDTO createContent(ContentCreateRequestDTO request) {
        Channel channel = channelRepository.findById(request.getChannelId())
                .orElseThrow(() -> new IllegalArgumentException("채널이 존재하지 않습니다."));

        validateContent(request.getContentType(), request.getAccessType(),
                request.getBody(), request.getMediaUrl(),
                request.getPreviewRatio(), request.getPrice());

        // 임시저장만 처리 (publishedAt은 null)
        Content content = Content.create(
                channel,
                request.getTitle(),
                request.getContentType(),
                request.getAccessType(),
                request.getPreviewRatio(),
                request.getBody(),
                request.getMediaUrl(),
                request.getPrice(),
                null); // 임시저장이므로 null

        return ContentResponseDTO.from(contentRepository.save(content));
    }

    /**
     * 콘텐츠 즉시 발행 (publishedAt을 현재 시점으로 설정)
     */
    public ContentResponseDTO publishContentImmediately(ContentCreateRequestDTO request) {
        Channel channel = channelRepository.findById(request.getChannelId())
                .orElseThrow(() -> new IllegalArgumentException("채널이 존재하지 않습니다."));

        validateContent(request.getContentType(), request.getAccessType(),
                request.getBody(), request.getMediaUrl(),
                request.getPreviewRatio(), request.getPrice());

        // 즉시 발행 (현재 시점으로 설정)
        LocalDateTime now = LocalDateTime.now();
        Content content = Content.create(
                channel,
                request.getTitle(),
                request.getContentType(),
                request.getAccessType(),
                request.getPreviewRatio(),
                request.getBody(),
                request.getMediaUrl(),
                request.getPrice(),
                now);

        Content saveContent = contentRepository.save(content);

        // 알림 이벤트 발행
        applicationEventPublisher.publishEvent(
                ContentPublishedEvent.create(saveContent.getId(), channel.getCreatorId()));

        return ContentResponseDTO.from(saveContent);
    }

    /**
     * 콘텐츠 예약 발행 (publishedAt을 미래 시점으로 설정)
     */
    public ContentResponseDTO scheduleContentPublish(ContentCreateRequestDTO request) {
        Channel channel = channelRepository.findById(request.getChannelId())
                .orElseThrow(() -> new IllegalArgumentException("채널이 존재하지 않습니다."));

        validateContent(request.getContentType(), request.getAccessType(),
                request.getBody(), request.getMediaUrl(),
                request.getPreviewRatio(), request.getPrice());

        // 예약 발행 시점 검증
        LocalDateTime publishedAt = request.getPublishedAt();
        if (publishedAt == null) {
            throw new IllegalArgumentException("예약 발행 시점(publishedAt)이 필요합니다.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (publishedAt.isBefore(now) || publishedAt.isEqual(now)) {
            throw new IllegalArgumentException("예약 발행 시점은 현재 시점 이후여야 합니다. 즉시 발행을 원하시면 publishContentImmediately를 사용하세요.");
        }

        Content content = Content.create(
                channel,
                request.getTitle(),
                request.getContentType(),
                request.getAccessType(),
                request.getPreviewRatio(),
                request.getBody(),
                request.getMediaUrl(),
                request.getPrice(),
                publishedAt);

        return ContentResponseDTO.from(contentRepository.save(content));
    }

    /**
     * 콘텐츠 수정 (제목, 타입, 가격 수정)
     */
    public ContentResponseDTO updateContent(Long contentId, ContentUpdateRequestDTO request) {
        Content content = findContent(contentId);

        // 수정 시에도 유효성 검증
        ContentType contentType = request.getContentType() != null 
                ? request.getContentType() 
                : content.getContentType();
        AccessType accessType = request.getAccessType() != null 
                ? request.getAccessType() 
                : content.getAccessType();
        String body = request.getBody() != null 
                ? request.getBody() 
                : content.getBody();
        String mediaUrl = request.getMediaUrl() != null 
                ? request.getMediaUrl() 
                : content.getMediaUrl();
        Integer previewRatio = request.getPreviewRatio() != null 
                ? request.getPreviewRatio() 
                : content.getPreviewRatio();
        Integer price = request.getPrice() != null 
                ? request.getPrice() 
                : content.getPrice();

        validateContent(contentType, accessType, body, mediaUrl, previewRatio, price);

        content.update(
                request.getTitle(),
                request.getContentType(),
                request.getAccessType(),
                request.getPreviewRatio(),
                request.getBody(),
                request.getMediaUrl(),
                request.getPrice(),
                request.getPublishedAt()
        );

        return ContentResponseDTO.from(contentRepository.save(content));
    }

    /**
     * 콘텐츠 삭제 (Soft Delete)
     */
    public void deleteContent(Long contentId) {
        Content content = findContent(contentId);
        content.softDelete();
        contentRepository.save(content);
    }

    /**
     * 콘텐츠 상세 조회 (접근 권한 검증 포함, 최초 조회 시 view_count 증가)
     */
    @Transactional
    public ContentResponseDTO getContentById(Long contentId, String userRole, Long userId) {
        Content content = findContent(contentId);

        // 게시 여부 확인 (publishedAt이 현재 시점 이전인지 확인)
        if (!content.isPublished()) {
            throw new IllegalArgumentException("아직 게시되지 않은 콘텐츠입니다.");
        }

        // 접근 권한 검증
        // SUBSCRIBER_ONLY, SINGLE_PURCHASE, PARTIAL 타입은 페이지 접근은 허용하되
        // 실제 콘텐츠 접근은 hasAccess로 제어
        // validateAccess는 예외를 던질 수 있지만, 페이지 접근은 허용하기 위해 예외를 무시함
        try {
            validateAccess(content, userRole, userId);
        } catch (IllegalArgumentException e) {
            // SUBSCRIBER_ONLY, SINGLE_PURCHASE, PARTIAL 타입은 페이지 접근은 허용
            // 예외를 무시하고 계속 진행 (hasAccess로 접근 권한 제어)
            // 예외가 발생해도 페이지는 접근 가능하도록 함
        } catch (Exception e) {
            // 다른 예외도 무시하고 계속 진행 (페이지 접근 허용)
            // 예외가 발생해도 페이지는 접근 가능하도록 함
        }

        // 조회수 증가 (로그인한 사용자의 최초 조회 시만)
        if (userId != null) {
            // 로그인한 사용자의 경우: 조회 기록 확인
            boolean hasViewed = contentViewRepository.existsByMemberIdAndContentId(userId, contentId);
            if (!hasViewed) {
                // 최초 조회인 경우 조회 기록 저장 및 조회수 증가
                ContentView contentView = ContentView.create(userId, contentId);
                contentViewRepository.save(contentView);
                content.increaseViewCount();
                contentRepository.save(content);
            } else {
                // 이미 조회한 경우 조회 기록의 lastViewedAt만 업데이트
                contentViewRepository.findByMemberIdAndContentId(userId, contentId)
                        .ifPresent(view -> {
                            view.updateLastViewedAt(LocalDateTime.now());
                            contentViewRepository.save(view);
                        });
            }
        }
        // 비로그인 사용자의 경우: 조회수 증가하지 않음

        // 좋아요 여부 확인 (userId가 null이면 false)
        Boolean isLiked = userId != null 
                ? contentLikeRepository.existsContentLikeByContentIdAndMemberId(contentId, userId)
                : false;

        // 접근 권한 여부 확인 (구매/구독 완료 여부)
        // 콘텐츠가 속한 채널의 구독 내역과 그 콘텐츠 단건 구매 내역을 확인하여 접근 권한 부여
        Boolean hasAccess = false;
        if (content.getAccessType() == AccessType.FREE) {
            hasAccess = true; // 무료 콘텐츠는 항상 접근 가능
        } else if (userId != null) {
            Long channelId = content.getChannel().getId();
            
            // 1. 채널 구독 내역 확인
            boolean hasActiveSubscription = subscriptionRepository.existsByMemberIdAndChannelIdAndStatus(
                    userId, channelId, SubscriptionStatus.ACTIVE);
            
            // 2. 콘텐츠 단건 구매 내역 확인
            boolean hasPurchasedContent = orderRepository.existsByMemberIdAndContentIdAndOrderTypeAndStatus(
                    userId, contentId, OrderType.CONTENT, OrderStatus.PAID);
            
            // 접근 타입에 따라 접근 권한 결정
            if (content.getAccessType() == AccessType.SUBSCRIBER_ONLY) {
                // 구독자만 접근 가능: 채널 구독 내역 확인
                hasAccess = hasActiveSubscription;
            } else if (content.getAccessType() == AccessType.SINGLE_PURCHASE) {
                // 단건 구매 콘텐츠: 구매 내역 또는 구독 내역 확인 (구독자도 접근 가능)
                hasAccess = hasPurchasedContent || hasActiveSubscription;
            } else if (content.getAccessType() == AccessType.PARTIAL) {
                // 미리보기 콘텐츠: 구매 내역 또는 구독 내역 확인 (구독자도 접근 가능)
                hasAccess = hasPurchasedContent || hasActiveSubscription;
            }
        }

        return ContentResponseDTO.from(content, isLiked, hasAccess);
    }

    /**
     * 콘텐츠 목록 조회 (정렬/필터 기반)
     */
    public Page<ContentListResponseDTO> getContentList(
            Long channelId,
            ContentType contentType,
            AccessType accessType,
            Pageable pageable
    ) {
        Page<Content> contents;
        LocalDateTime now = LocalDateTime.now();

        // 필터링 조건에 따라 적절한 메서드 호출
        if (channelId != null) {
            // 채널별 조회
            if (contentType != null && accessType != null) {
                contents = contentRepository.findByChannelIdAndContentTypeAndAccessTypeAndIsDeletedFalse(
                        channelId, contentType, accessType, pageable);
            } else if (contentType != null) {
                contents = contentRepository.findByChannelIdAndContentTypeAndIsDeletedFalse(channelId, contentType, pageable);
            } else if (accessType != null) {
                contents = contentRepository.findByChannelIdAndAccessTypeAndIsDeletedFalse(channelId, accessType, pageable);
            } else {
                contents = contentRepository.findByChannelIdAndIsDeletedFalse(channelId, pageable);
            }
        } else {
            // 전체 조회
            if (contentType != null && accessType != null) {
                contents = contentRepository.findByContentTypeAndAccessTypeAndIsDeletedFalse(
                        contentType, accessType, pageable);
            } else if (contentType != null) {
                contents = contentRepository.findByContentTypeAndIsDeletedFalse(contentType, pageable);
            } else if (accessType != null) {
                contents = contentRepository.findByAccessTypeAndIsDeletedFalse(accessType, pageable);
            } else {
                contents = contentRepository.findByIsDeletedFalse(pageable);
            }
        }

        // 서비스에서 게시된 콘텐츠만 필터링 (publishedAt이 null이 아니고 현재 시점 이전인 것만)
        List<Content> publishedContents = contents.getContent().stream()
                .filter(content -> content.getPublishedAt() != null && 
                                  (content.getPublishedAt().isBefore(now) || content.getPublishedAt().isEqual(now)))
                .toList();

        // 필터링된 결과를 Page로 변환
        Page<Content> publishedPage = new org.springframework.data.domain.PageImpl<>(
                publishedContents, 
                pageable, 
                publishedContents.size()
        );

        return publishedPage.map(ContentListResponseDTO::from);
    }

    /**
     * 채널의 대표 콘텐츠 3개 조회 (조회수 높은 순)
     * 게시된 콘텐츠 중에서 조회수가 높은 상위 3개를 반환
     */
    public List<ContentListResponseDTO> getFeaturedContentsByChannelId(Long channelId) {
        LocalDateTime now = LocalDateTime.now();
        
        // 채널별 조회수 높은 순으로 3개 조회
        Page<Content> contentPage = contentRepository.findTop3ByChannelIdAndIsDeletedFalseOrderByViewCountDesc(
                channelId, org.springframework.data.domain.PageRequest.of(0, 3));
        List<Content> contents = contentPage.getContent();
        
        // 게시된 콘텐츠만 필터링
        List<Content> publishedContents = contents.stream()
                .filter(content -> content.getPublishedAt() != null && 
                                  (content.getPublishedAt().isBefore(now) || content.getPublishedAt().isEqual(now)))
                .limit(3)
                .toList();
        
        return publishedContents.stream()
                .map(ContentListResponseDTO::from)
                .toList();
    }

    /**
     * creatorId별 총 콘텐츠 수 조회 (삭제되지 않은 콘텐츠만)
     * 한 크리에이터당 하나의 채널만 존재
     */
    public long getTotalContentCountByCreatorId(Long creatorId) {
        // creatorId로 채널 조회 (ChannelRepository의 기존 메서드 사용)
        Optional<Channel> channel = channelRepository.findOneByCreatorId(creatorId);
        
        if (channel.isEmpty()) {
            return 0;
        }
        
        // 한 크리에이터당 하나의 채널만 존재하므로 첫 번째 채널 사용
        Long channelId = channel.get().getId();
        
        return contentRepository.countByChannelIdAndIsDeletedFalse(channelId);
    }

    /**
     * creatorId별 총 조회수 조회 (해당 크리에이터의 모든 콘텐츠 viewCount 합계)
     * 한 크리에이터당 하나의 채널만 존재
     */
    public long getTotalViewCountByCreatorId(Long creatorId) {
        // creatorId로 채널 조회 (ChannelRepository의 기존 메서드 사용)
        Optional<Channel> channel = channelRepository.findOneByCreatorId(creatorId);
        
        if (channel.isEmpty()) {
            return 0;
        }
        
        // 한 크리에이터당 하나의 채널만 존재하므로 첫 번째 채널 사용
        Long channelId = channel.get().getId();
        
        return contentRepository.getTotalViewCountByChannelId(channelId);
    }

    /**
     * creatorId별 최근 5일간 발행된 콘텐츠 개수 조회
     * 한 크리에이터당 하나의 채널만 존재
     */
    public long getRecentPublishedContentCountByCreatorId(Long creatorId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime fiveDaysAgo = now.minusDays(5);
        
        // creatorId로 채널 조회 (ChannelRepository의 기존 메서드 사용)
        Optional<Channel> channel = channelRepository.findOneByCreatorId(creatorId);
        
        if (channel.isEmpty()) {
            return 0;
        }
        
        // 한 크리에이터당 하나의 채널만 존재하므로 첫 번째 채널 사용
        Long channelId = channel.get().getId();
        
        return contentRepository.countByChannelIdAndPublishedAtBetweenAndIsDeletedFalse(
                channelId, fiveDaysAgo, now);
    }

    /**
     * 콘텐츠 조회
     */
    public Content findContent(Long contentId) {
        return contentRepository.findByIdAndIsDeletedFalse(contentId)
                .orElseThrow(() -> new IllegalArgumentException("콘텐츠가 존재하지 않습니다."));
    }

    /**
     * 접근 권한 검증
     * FREE: 모든 사용자 접근 가능
     * SUBSCRIBER_ONLY: 구독자만 접근 가능 (구독 도메인 완성 후 구현)
     * SINGLE_PURCHASE: 구매한 사용자만 접근 가능 (구매 도메인 완성 후 구현)
     * PARTIAL: 미리보기 제공, 전체는 구매 필요
     */
    private void validateAccess(Content content, String userRole, Long userId) {
        AccessType accessType = content.getAccessType();

        // FREE 콘텐츠는 모든 사용자 접근 가능
        if (accessType == AccessType.FREE) {
            return;
        }

        // 비회원은 FREE 콘텐츠만 접근 가능
        if (userRole == null) {
            throw new IllegalArgumentException("접근 권한이 없습니다. 회원가입 후 이용해주세요.");
        }

        // 관리자는 모든 콘텐츠 접근 가능
        if ("ADMIN".equals(userRole) || "ROLE_ADMIN".equals(userRole)) {
            return;
        }

        // 크리에이터는 자신의 콘텐츠에 접근 가능
        if ("CREATOR".equals(userRole) || "ROLE_CREATOR".equals(userRole)) {
            if (content.getChannel().getCreatorId().equals(userId)) {
                return;
            }
            throw new IllegalArgumentException("자신의 콘텐츠만 접근할 수 있습니다.");
        }

        // 일반 유저는 구매한 콘텐츠 또는 구독한 채널의 콘텐츠에 접근 가능
        if ("USER".equals(userRole) || "ROLE_USER".equals(userRole)) {
            Long channelId = content.getChannel().getId();

            if (accessType == AccessType.SUBSCRIBER_ONLY) {
                // 구독자만 접근 가능: 해당 채널에 대한 활성 구독이 있는지 확인
                boolean hasActiveSubscription = subscriptionRepository.existsByMemberIdAndChannelIdAndStatus(
                        userId, channelId, SubscriptionStatus.ACTIVE);
                if (!hasActiveSubscription) {
                    throw new IllegalArgumentException("이 콘텐츠는 구독자만 접근할 수 있습니다.");
                }
            } else if (accessType == AccessType.SINGLE_PURCHASE) {
                // 구매한 사용자만 접근 가능: 해당 콘텐츠를 구매했는지 확인
                boolean hasPurchased = orderRepository.existsByMemberIdAndContentIdAndOrderTypeAndStatus(
                        userId, content.getId(), OrderType.CONTENT, OrderStatus.PAID);
                if (!hasPurchased) {
                    throw new IllegalArgumentException("이 콘텐츠를 구매해야 접근할 수 있습니다.");
                }
            } else if (accessType == AccessType.PARTIAL) {
                // PARTIAL: 구매했으면 전체 접근 가능, 아니면 미리보기만 제공
                // 구매 여부 확인 (구매했으면 접근 허용, 아니면 미리보기만 제공하므로 예외 발생하지 않음)
                // 실제 미리보기 처리는 getContentById에서 처리
                boolean hasPurchased = orderRepository.existsByMemberIdAndContentIdAndOrderTypeAndStatus(
                        userId, content.getId(), OrderType.CONTENT, OrderStatus.PAID);
                // 구매하지 않았어도 미리보기는 제공하므로 예외를 발생시키지 않음
                // 전체 콘텐츠 접근 여부는 별도로 확인 필요 (현재는 접근 허용)
            }
        }
    }

    /**
     * 콘텐츠 유효성 검증
     */
    private void validateContent(ContentType type, AccessType accessType,
                                 String body, String mediaUrl,
                                 Integer previewRatio, Integer price) {

        if (type == ContentType.TEXT && (body == null || body.isBlank())) {
            throw new IllegalArgumentException("TEXT 콘텐츠는 body가 필수입니다.");
        }

        if (type == ContentType.VIDEO && (mediaUrl == null || mediaUrl.isBlank())) {
            throw new IllegalArgumentException("VIDEO 콘텐츠는 mediaUrl이 필수입니다.");
        }

        if (accessType == AccessType.PARTIAL && (previewRatio == null || previewRatio <= 0 || previewRatio > 100)) {
            throw new IllegalArgumentException("PARTIAL 콘텐츠는 0보다 크고 100 이하인 previewRatio가 필요합니다.");
        }

        if (accessType == AccessType.FREE && price != null && price != 0) {
            throw new IllegalArgumentException("FREE 콘텐츠의 가격은 0이어야 합니다.");
        }
    }

    /**
     * 최근 본 콘텐츠 조회
     * 사용자가 최근에 조회한 콘텐츠를 lastViewedAt 기준으로 정렬하여 반환
     */
    public Page<ContentListResponseDTO> getRecentViewedContents(Long memberId, Pageable pageable) {
        // ContentView 조회 (lastViewedAt 기준 내림차순)
        Page<ContentView> contentViews = contentViewRepository.findByMemberIdOrderByLastViewedAtDesc(memberId, pageable);

        // ContentView의 contentId로 Content 조회 및 DTO 변환
        List<ContentListResponseDTO> contentList = contentViews.getContent().stream()
                .map(contentView -> {
                    try {
                        // 삭제되지 않은 콘텐츠만 조회
                        Content content = contentRepository.findByIdAndIsDeletedFalse(contentView.getContentId())
                                .orElse(null);
                        if (content == null) {
                            return null;
                        }
                        // 게시된 콘텐츠만 반환
                        if (content.isPublished()) {
                            return ContentListResponseDTO.from(content);
                        }
                        return null;
                    } catch (Exception e) {
                        // 콘텐츠가 존재하지 않거나 삭제된 경우 null 반환
                        return null;
                    }
                })
                .filter(content -> content != null) // null 제거 (삭제되었거나 게시되지 않은 콘텐츠)
                .toList();

        // 필터링된 결과를 Page로 변환
        return new org.springframework.data.domain.PageImpl<>(
                contentList,
                pageable,
                contentViews.getTotalElements()
        );
    }

    /**
     * 예약 발행 처리
     * publishedAt이 현재 시점 이전인 예약 발행 대기 중인 콘텐츠를 발행 처리
     */
    public void processScheduledPublications() {
        LocalDateTime now = LocalDateTime.now();
        List<Content> scheduledContents = contentRepository.findScheduledContentsToPublish(now);

        // 예약 발행된 콘텐츠 처리
        for (Content content : scheduledContents) {
            // 아직 발행되지 않은 콘텐츠만 발행 처리
            if (!content.isPublished()) {
                content.publish();
                contentRepository.save(content);
                // 알림 이벤트 발행
                applicationEventPublisher.publishEvent(
                        ContentPublishedEvent.create(content.getId(), content.getChannel().getCreatorId())
                );
            }
        }
    }
}
