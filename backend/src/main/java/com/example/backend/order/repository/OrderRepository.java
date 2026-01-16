package com.example.backend.order.repository;

import com.example.backend.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    // 회원별 주문 목록 조회 (최신순)
    List<Order> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    // 회원별 주문 목록 조회 (페이징)
    Page<Order> findByMemberIdOrderByCreatedAtDesc(Long memberId, Pageable pageable);
}

