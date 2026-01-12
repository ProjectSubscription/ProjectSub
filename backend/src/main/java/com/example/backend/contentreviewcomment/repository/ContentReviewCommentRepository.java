package com.example.backend.contentreviewcomment.repository;

import com.example.backend.contentreviewcomment.domain.ContentReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContentReviewCommentRepository extends JpaRepository<ContentReviewComment, Long> {

    @Query("select distinct c from ContentReviewComment c " + // (3) ID가 같은 부모 댓글 중복 제거
            "join fetch c.member " + // (1) 작성자 정보 한번에 가져오기
            "left join fetch c.children child " + // (1) 대댓글 리스트 한번에 가져오기
            "left join fetch child.member " + // (1) 대댓글 작성자까지 한번에 가져오기
            "where c.contentReview.id = :reviewId " + // (2) 파라미터로 받은 reviewId와 일치하는 것만
            "and c.parent is null " + // 최상위 댓글만 조회
            "and c.isDeleted = false")
    List<ContentReviewComment> findByContentReviewIdWithAllRelations(@Param("reviewId") Long reviewId);
}