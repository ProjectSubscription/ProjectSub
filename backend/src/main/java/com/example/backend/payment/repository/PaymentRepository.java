package com.example.backend.payment.repository;

import com.example.backend.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
