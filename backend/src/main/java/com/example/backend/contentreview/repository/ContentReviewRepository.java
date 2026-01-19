package com.example.backend.contentreview.repository;

import com.example.backend.contentreview.entity.ContentReview;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContentReviewRepository extends JpaRepository<ContentReview, Long> {

    boolean existsByContentIdAndMemberIdAndIsDeletedFalse(Long contentId, Long memberId);

    /**
     * 특정 콘텐츠의 리뷰 조회 (삭제되지 않은 리뷰만, 추천 수 기준 정렬)
     * 추천 수가 많은 순으로 정렬하고, 추천 수가 같으면 최신순으로 정렬
     * Content와 Channel을 JOIN FETCH로 가져옴 (Member는 Service에서 별도 조회)
     */
    @Query("SELECT r FROM ContentReview r " +
           "JOIN FETCH r.content c " +
           "JOIN FETCH c.channel " +
           "WHERE r.content.id = :contentId AND r.isDeleted = false " +
           "ORDER BY (SELECT COUNT(l) FROM ContentReviewLike l WHERE l.reviewId = r.id) DESC, r.createdAt DESC")
    List<ContentReview> findByContentIdAndIsDeletedFalseOrderByLikeCountDesc(@Param("contentId") Long contentId);

    /**
     * 특정 콘텐츠의 리뷰 조회 (삭제되지 않은 리뷰만, 기본 정렬)
     * @deprecated 추천 수 기준 정렬을 사용하려면 findByContentIdAndIsDeletedFalseOrderByLikeCountDesc 사용
     */
    @Deprecated
    List<ContentReview> findByContentIdAndIsDeletedFalse(Long contentId);

    /**
     * 모든 리뷰 조회 (삭제되지 않은 리뷰만, Content와 Channel 포함)
     * 콘텐츠별 최고 추천 리뷰 선택을 위해 사용
     */
    @Query("SELECT r FROM ContentReview r " +
           "JOIN FETCH r.content c " +
           "JOIN FETCH c.channel " +
           "WHERE r.isDeleted = false")
    List<ContentReview> findAllWithContentAndChannel();

    /**
     * 특정 채널의 최근 리뷰 조회 (삭제되지 않은 리뷰만, 최신순 정렬)
     * Content와 Channel을 JOIN FETCH로 가져옴 (Member는 Service에서 별도 조회)
     */
    @Query("SELECT r FROM ContentReview r " +
           "JOIN FETCH r.content c " +
           "JOIN FETCH c.channel ch " +
           "WHERE ch.id = :channelId AND r.isDeleted = false " +
           "ORDER BY r.createdAt DESC")
    List<ContentReview> findByChannelIdAndIsDeletedFalseOrderByCreatedAtDesc(@Param("channelId") Long channelId, Pageable pageable);
}