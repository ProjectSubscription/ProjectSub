package com.example.backend.order.repository;

import com.example.backend.order.entity.Order;
import com.example.backend.order.entity.OrderStatus;
import com.example.backend.order.entity.OrderType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    // 회원별 주문 목록 조회 (최신순)
    List<Order> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    // 회원별 주문 목록 조회 (페이징)
    Page<Order> findByMemberIdOrderByCreatedAtDesc(Long memberId, Pageable pageable);

    // 특정 회원이 특정 콘텐츠를 구매했는지 확인 (결제 완료된 주문만)
    // COUNT를 사용하지만 단일 쿼리로 실행되며 N+1 문제 발생하지 않음
    // o.member.id와 o.content.id는 JPQL에서 자동으로 외래키를 사용하므로 JOIN 최적화됨
    @Query("SELECT COUNT(o) > 0 FROM Order o WHERE o.member.id = :memberId " +
           "AND o.content.id = :contentId " +
           "AND o.orderType = :orderType " +
           "AND o.status = :status")
    boolean existsByMemberIdAndContentIdAndOrderTypeAndStatus(
            @Param("memberId") Long memberId,
            @Param("contentId") Long contentId,
            @Param("orderType") OrderType orderType,
            @Param("status") OrderStatus status
    );
}

