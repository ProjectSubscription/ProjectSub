package com.example.backend.content.repository;

import com.example.backend.content.entity.AccessType;
import com.example.backend.content.entity.Content;
import com.example.backend.content.entity.ContentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ContentRepository extends JpaRepository<Content, Long> {
    
    // 삭제되지 않은 콘텐츠 조회
    Optional<Content> findByIdAndIsDeletedFalse(Long id);
    
    // 삭제되지 않은 콘텐츠 목록 조회
    Page<Content> findByIsDeletedFalse(Pageable pageable);
    
    // 콘텐츠 타입으로 필터링
    Page<Content> findByContentTypeAndIsDeletedFalse(ContentType contentType, Pageable pageable);
    
    // 접근 타입으로 필터링
    Page<Content> findByAccessTypeAndIsDeletedFalse(AccessType accessType, Pageable pageable);
    
    // 콘텐츠 타입과 접근 타입으로 필터링
    Page<Content> findByContentTypeAndAccessTypeAndIsDeletedFalse(
            ContentType contentType, 
            AccessType accessType, 
            Pageable pageable
    );
    
    // 채널별 목록 조회 (channel.id 사용)
    @Query("SELECT c FROM Content c WHERE c.channel.id = :channelId AND c.isDeleted = false")
    Page<Content> findByChannelIdAndIsDeletedFalse(@Param("channelId") Long channelId, Pageable pageable);
    
    @Query("SELECT c FROM Content c WHERE c.channel.id = :channelId AND c.contentType = :contentType AND c.isDeleted = false")
    Page<Content> findByChannelIdAndContentTypeAndIsDeletedFalse(@Param("channelId") Long channelId, @Param("contentType") ContentType contentType, Pageable pageable);
    
    @Query("SELECT c FROM Content c WHERE c.channel.id = :channelId AND c.accessType = :accessType AND c.isDeleted = false")
    Page<Content> findByChannelIdAndAccessTypeAndIsDeletedFalse(@Param("channelId") Long channelId, @Param("accessType") AccessType accessType, Pageable pageable);
    
    @Query("SELECT c FROM Content c WHERE c.channel.id = :channelId AND c.contentType = :contentType AND c.accessType = :accessType AND c.isDeleted = false")
    Page<Content> findByChannelIdAndContentTypeAndAccessTypeAndIsDeletedFalse(@Param("channelId") Long channelId, @Param("contentType") ContentType contentType, @Param("accessType") AccessType accessType, Pageable pageable);
    
    // 채널별 대표 콘텐츠 조회 (조회수 높은 순)
    @Query("SELECT c FROM Content c WHERE c.channel.id = :channelId AND c.isDeleted = false ORDER BY c.viewCount DESC")
    Page<Content> findTop3ByChannelIdAndIsDeletedFalseOrderByViewCountDesc(@Param("channelId") Long channelId, Pageable pageable);
    
    // 총 콘텐츠 수 (삭제되지 않은 것만)
    long countByIsDeletedFalse();
    
    // 최근 5일간 발행된 콘텐츠 개수
    long countByPublishedAtBetweenAndIsDeletedFalse(LocalDateTime startDate, LocalDateTime endDate);
    
    // 총 조회수 합계 (삭제되지 않은 콘텐츠의 viewCount 합계)
    @Query("SELECT COALESCE(SUM(c.viewCount), 0) FROM Content c WHERE c.isDeleted = false")
    Long getTotalViewCount();

    // 채널 ID로 통계 조회 (단일 채널)
    @Query("SELECT COUNT(c) FROM Content c WHERE c.channel.id = :channelId AND c.isDeleted = false")
    long countByChannelIdAndIsDeletedFalse(@Param("channelId") Long channelId);
    
    @Query("SELECT COALESCE(SUM(c.viewCount), 0) FROM Content c WHERE c.channel.id = :channelId AND c.isDeleted = false")
    Long getTotalViewCountByChannelId(@Param("channelId") Long channelId);
    
    @Query("SELECT COUNT(c) FROM Content c WHERE c.channel.id = :channelId AND c.publishedAt BETWEEN :startDate AND :endDate AND c.isDeleted = false")
    long countByChannelIdAndPublishedAtBetweenAndIsDeletedFalse(@Param("channelId") Long channelId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // 예약 발행 대기 중인 콘텐츠 조회 (publishedAt이 null이 아니고 현재 시점 이하인 것)
    @Query("SELECT c FROM Content c WHERE c.publishedAt IS NOT NULL AND c.publishedAt <= :now AND c.isDeleted = false")
    List<Content> findScheduledContentsToPublish(@Param("now") LocalDateTime now);
    
}
