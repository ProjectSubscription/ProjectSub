package com.example.backend.channel.repository;

import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.entity.ChannelCategory;
import com.example.backend.subscription.entity.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
    // 활성 채널 단건 조회
    Optional<Channel> findByIdAndIsActiveTrue(Long id);

    // 전체 활성 채널 조회
    Page<Channel> findByIsActiveTrue(Pageable pageable);

    // 카테고리별 활성 채널 조회
    Page<Channel> findByCategoryAndIsActiveTrue(
            ChannelCategory category,
            Pageable pageable
    );

    @Query("""
        select c from Channel c
        left join Subscription s
            on s.channelId = c.id and s.status = :status
        where c.isActive = true
          and (:category is null or c.category = :category)
        group by c.id
        order by count(s.id) desc, c.createdAt desc
    """)
    Page<Channel> findActiveChannelsOrderBySubscriberCount(
            @Param("category") ChannelCategory category,
            @Param("status") SubscriptionStatus status,
            Pageable pageable
    );

    Optional<Channel> findOneByCreatorId(Long creatorId);
}
