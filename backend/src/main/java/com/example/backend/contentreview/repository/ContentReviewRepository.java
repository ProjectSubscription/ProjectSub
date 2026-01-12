package com.example.backend.contentreview.repository;

import com.example.backend.contentreview.entity.ContentReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContentReviewRepository extends JpaRepository<ContentReview, Long> {

    boolean existsByContentIdAndMemberIdAndIsDeletedFalse(Long contentId, Long memberId);

    List<ContentReview> findByContentIdAndIsDeletedFalse(Long contentId);
}