package com.example.backend.settlement.repository;

import com.example.backend.settlement.entity.Settlement;
import com.example.backend.settlement.entity.SettlementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    /**
     * 크리에이터와 정산 기간으로 정산 조회
     */
    @Query("SELECT s FROM Settlement s WHERE s.creator.id = :creatorId AND s.settlementPeriod = :settlementPeriod")
    Optional<Settlement> findByCreatorIdAndSettlementPeriod(
            @Param("creatorId") Long creatorId,
            @Param("settlementPeriod") String settlementPeriod
    );

    /**
     * 재시도 대상 정산 조회 (FAILED 상태이고, 최대 재시도 횟수 미만이며, 일정 시간 경과)
     */
    @Query("SELECT s FROM Settlement s " +
           "WHERE s.status = :status " +
           "AND s.retryCount < :maxRetryCount " +
           "AND (s.lastRetryAt IS NULL OR s.lastRetryAt <= :retryAfter)")
    List<Settlement> findRetryableSettlements(
            @Param("status") SettlementStatus status,
            @Param("maxRetryCount") Integer maxRetryCount,
            @Param("retryAfter") LocalDateTime retryAfter
    );

    /**
     * 크리에이터별 정산 목록 조회 (최신순)
     */
    @Query("SELECT s FROM Settlement s WHERE s.creator.id = :creatorId ORDER BY s.settlementPeriod DESC")
    List<Settlement> findByCreatorIdOrderBySettlementPeriodDesc(@Param("creatorId") Long creatorId);

    /**
     * 관리자용: 전체 정산 목록 조회 (필터링, 페이징)
     */
    @Query(value = "SELECT s FROM Settlement s " +
           "JOIN FETCH s.creator c " +
           "JOIN FETCH c.member " +
           "WHERE (:creatorId IS NULL OR s.creator.id = :creatorId) " +
           "AND (:settlementPeriod IS NULL OR s.settlementPeriod = :settlementPeriod) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "ORDER BY s.settlementPeriod DESC, s.createdAt DESC",
           countQuery = "SELECT COUNT(s) FROM Settlement s " +
           "WHERE (:creatorId IS NULL OR s.creator.id = :creatorId) " +
           "AND (:settlementPeriod IS NULL OR s.settlementPeriod = :settlementPeriod) " +
           "AND (:status IS NULL OR s.status = :status)")
    Page<Settlement> findAllWithFilters(
            @Param("creatorId") Long creatorId,
            @Param("settlementPeriod") String settlementPeriod,
            @Param("status") SettlementStatus status,
            Pageable pageable
    );

    /**
     * 관리자용: 크리에이터 닉네임으로 검색
     */
    @Query(value = "SELECT s FROM Settlement s " +
           "JOIN FETCH s.creator c " +
           "JOIN FETCH c.member m " +
           "WHERE (:creatorNickname IS NULL OR m.nickname LIKE CONCAT('%', :creatorNickname, '%')) " +
           "AND (:settlementPeriod IS NULL OR s.settlementPeriod = :settlementPeriod) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "ORDER BY s.settlementPeriod DESC, s.createdAt DESC",
           countQuery = "SELECT COUNT(s) FROM Settlement s " +
           "JOIN s.creator c " +
           "JOIN c.member m " +
           "WHERE (:creatorNickname IS NULL OR m.nickname LIKE CONCAT('%', :creatorNickname, '%')) " +
           "AND (:settlementPeriod IS NULL OR s.settlementPeriod = :settlementPeriod) " +
           "AND (:status IS NULL OR s.status = :status)")
    Page<Settlement> findAllByCreatorNickname(
            @Param("creatorNickname") String creatorNickname,
            @Param("settlementPeriod") String settlementPeriod,
            @Param("status") SettlementStatus status,
            Pageable pageable
    );

    /**
     * 정산 통계: 전체 정산 금액 합계
     */
    @Query("SELECT COALESCE(SUM(s.payoutAmount), 0) FROM Settlement s WHERE s.status = 'COMPLETED'")
    Long getTotalSettlementAmount();

    /**
     * 정산 통계: 이번 달 정산 금액 합계 (하위 호환성 유지)
     */
    @Query("SELECT COALESCE(SUM(s.payoutAmount), 0) FROM Settlement s " +
           "WHERE s.status = 'COMPLETED' " +
           "AND s.settlementPeriod = :thisMonth")
    Long getThisMonthSettlementAmount(@Param("thisMonth") String thisMonth);

    /**
     * 정산 통계: 이번 주 정산 금액 합계
     */
    @Query("SELECT COALESCE(SUM(s.payoutAmount), 0) FROM Settlement s " +
           "WHERE s.status = 'COMPLETED' " +
           "AND s.settlementPeriod = :thisWeekPeriod")
    Long getThisWeekSettlementAmount(@Param("thisWeekPeriod") String thisWeekPeriod);

    /**
     * 정산 통계: 상태별 건수
     */
    @Query("SELECT COUNT(s) FROM Settlement s WHERE s.status = :status")
    Long countByStatus(@Param("status") SettlementStatus status);

    /**
     * 정산 통계: 재시도 필요 건수 (FAILED 상태이고 재시도 횟수 미만)
     */
    @Query("SELECT COUNT(s) FROM Settlement s " +
           "WHERE s.status = 'FAILED' " +
           "AND s.retryCount < :maxRetryCount")
    Long countRetryNeeded(@Param("maxRetryCount") Integer maxRetryCount);

    /**
     * 관리자용: 정산 상세 조회 (Creator와 Member 포함)
     */
    @Query("SELECT s FROM Settlement s " +
           "JOIN FETCH s.creator c " +
           "JOIN FETCH c.member " +
           "WHERE s.id = :settlementId")
    Optional<Settlement> findByIdWithCreatorAndMember(@Param("settlementId") Long settlementId);
}

