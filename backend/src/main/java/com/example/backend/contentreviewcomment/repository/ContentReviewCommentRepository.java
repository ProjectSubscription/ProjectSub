package com.example.backend.contentreviewcomment.repository;

import com.example.backend.contentreviewcomment.entity.ContentReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContentReviewCommentRepository extends JpaRepository<ContentReviewComment, Long> {

    /**
     * 리뷰의 댓글 조회 (Member는 JOIN FETCH 제외 - Service에서 별도 조회)
     * @SQLRestriction을 우회하기 위해 Member는 Service에서 findMemberIncludingDeleted로 조회
     */
    @Query("select distinct c from ContentReviewComment c " + // (3) ID가 같은 부모 댓글 중복 제거
            "left join fetch c.children child " + // (1) 대댓글 리스트 한번에 가져오기
            "where c.contentReview.id = :reviewId " + // (2) 파라미터로 받은 reviewId와 일치하는 것만
            "and c.parent is null " + // 최상위 댓글만 조회
            "and c.isDeleted = false")
    List<ContentReviewComment> findByContentReviewIdWithAllRelations(@Param("reviewId") Long reviewId);
}