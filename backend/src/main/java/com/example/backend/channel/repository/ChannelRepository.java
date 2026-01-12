package com.example.backend.channel.repository;

import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.entity.ChannelCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
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

    Optional<Channel> findOneByCreatorId(Long creatorId);
}
