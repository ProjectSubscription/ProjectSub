package com.example.backend.payment.repository;

import com.example.backend.payment.entity.Payment;
import com.example.backend.payment.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentKey(String paymentKey);

    @Query("SELECT p FROM Payment p WHERE p.order.id = :orderId")
    Optional<Payment> findByOrderId(@Param("orderId") Long orderId);

    /**
     * 사용자별 결제 이력 조회
     */
    @Query("SELECT p FROM Payment p WHERE p.order.member.id = :memberId ORDER BY p.requestedAt DESC")
    Page<Payment> findByMemberId(@Param("memberId") Long memberId, Pageable pageable);

    /**
     * 사용자별 결제 이력 총 개수
     */
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.order.member.id = :memberId")
    Long countByMemberId(@Param("memberId") Long memberId);

    /**
     * 특정 기간 내 PAID 상태인 결제 내역 조회 (정산용)
     * Order, Subscription, Content, Channel을 함께 조회하여 N+1 문제 방지
     */
    @Query("""
        SELECT DISTINCT p FROM Payment p
        LEFT JOIN FETCH p.order o
        LEFT JOIN FETCH o.subscription s
        LEFT JOIN FETCH o.content c
        LEFT JOIN FETCH c.channel ch
        WHERE p.status = :status
        AND p.approvedAt >= :startDateTime
        AND p.approvedAt <= :endDateTime
        ORDER BY p.approvedAt ASC
        """)
    List<Payment> findPaidPaymentsInPeriod(
            @Param("status") PaymentStatus status,
            @Param("startDateTime") java.time.LocalDateTime startDateTime,
            @Param("endDateTime") java.time.LocalDateTime endDateTime
    );

}
