package com.example.backend.creatorapplication.repository;

import com.example.backend.creatorapplication.entity.ApprovalStatus;
import com.example.backend.creatorapplication.entity.CreatorApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreatorApplicationRepository extends JpaRepository<CreatorApplication, Long> {

    /**
     * 특정 회원의 신청내역을 조회
     * EntityGraph -> 간단한 fetch join (count 쿼리문도 자동 분리)
     * */
    @EntityGraph(attributePaths = "member")
    Page<CreatorApplication> findByMemberId(Long memberId, Pageable pageable);

    /**
     * 모든 회원의 신청 내역 조회
     * EntityGraph -> 간단한 fetch join (count 쿼리문도 자동 분리)
     */
    @EntityGraph(attributePaths = "member")
    Page<CreatorApplication> findAll(Pageable pageable);

    /**
     * 승인 대기중인 신청여부 체크
     * */
    boolean existsByMemberIdAndStatus(Long memberId, ApprovalStatus status);

}
