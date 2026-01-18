package com.example.backend.content.repository;

import com.example.backend.content.entity.ContentView;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContentViewRepository extends JpaRepository<ContentView, Long> {

    Optional<ContentView> findByMemberIdAndContentId(Long memberId, Long contentId);

    boolean existsByMemberIdAndContentId(Long memberId, Long contentId);

    // 최근 본 콘텐츠 조회 (lastViewedAt 기준 내림차순)
    @Query("SELECT cv FROM ContentView cv WHERE cv.memberId = :memberId ORDER BY cv.lastViewedAt DESC")
    Page<ContentView> findByMemberIdOrderByLastViewedAtDesc(@Param("memberId") Long memberId, Pageable pageable);
}
