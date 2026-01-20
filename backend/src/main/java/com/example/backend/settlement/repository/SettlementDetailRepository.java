package com.example.backend.settlement.repository;

import com.example.backend.settlement.entity.SettlementDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SettlementDetailRepository extends JpaRepository<SettlementDetail, Long> {

    /**
     * 정산별 상세 내역 조회 (결제 정보 포함)
     */
    @Query("SELECT sd FROM SettlementDetail sd " +
           "LEFT JOIN FETCH sd.payment p " +
           "LEFT JOIN FETCH p.order o " +
           "WHERE sd.settlement.id = :settlementId " +
           "ORDER BY sd.createdAt DESC")
    List<SettlementDetail> findBySettlementIdWithPayment(@Param("settlementId") Long settlementId);

    /**
     * 정산과 결제로 상세 내역 존재 여부 확인 (중복 체크용)
     */
    boolean existsBySettlementIdAndPaymentId(Long settlementId, Long paymentId);
}

