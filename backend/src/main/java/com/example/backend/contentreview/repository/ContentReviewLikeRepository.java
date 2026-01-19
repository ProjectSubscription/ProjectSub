package com.example.backend.contentreview.repository;

import com.example.backend.contentreview.entity.ContentReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentReviewLikeRepository extends JpaRepository<ContentReviewLike, Long> {
    /**
     * 특정 리뷰에 특정 회원이 추천했는지 확인
     */
    boolean existsByReviewIdAndMemberId(Long reviewId, Long memberId);

    /**
     * 특정 리뷰에 특정 회원의 추천 삭제
     */
    void deleteByReviewIdAndMemberId(Long reviewId, Long memberId);

    /**
     * 특정 리뷰의 추천 수 조회
     */
    long countByReviewId(Long reviewId);
}
