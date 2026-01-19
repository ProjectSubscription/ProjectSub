package com.example.backend.order.entity;

import com.example.backend.content.entity.Content;
import com.example.backend.member.entity.Member;
import com.example.backend.subscription.entity.Subscription;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders",
        indexes = @Index(name = "idx_order_code", columnList = "orderCode", unique = true))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderCode;   // Toss orderId

    @ManyToOne(fetch = FetchType.LAZY)
    private Member member;

    @Enumerated(EnumType.STRING)
    private OrderType orderType;

    // SUBSCRIPTION 타입일 때 사용: 구독 플랜 ID
    private Long planId;

    // SUBSCRIPTION 타입일 때: 결제 완료 후 생성된 구독 (결제 시점에는 null)
    @ManyToOne(fetch = FetchType.LAZY)
    private Subscription subscription;

    // CONTENT 타입일 때 사용: 콘텐츠
    @ManyToOne(fetch = FetchType.LAZY)
    private Content content;

    private Long originalAmount;
    private Long discountAmount;

    // 쿠폰 사용 시 member_coupons 테이블의 ID
    private Long memberCouponId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private LocalDateTime createdAt;

    /**
     * SUBSCRIPTION 타입 주문 생성
     */
    public static Order createSubscriptionOrder(
            String orderCode,
            Member member,
            Long planId,
            Long originalAmount,
            Long discountAmount,
            Long memberCouponId
    ) {
        return Order.builder()
                .orderCode(orderCode)
                .member(member)
                .orderType(OrderType.SUBSCRIPTION)
                .planId(planId)
                .subscription(null) // 결제 완료 후 생성
                .content(null)
                .originalAmount(originalAmount)
                .discountAmount(discountAmount)
                .memberCouponId(memberCouponId)
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * CONTENT 타입 주문 생성
     */
    public static Order createContentOrder(
            String orderCode,
            Member member,
            Content content,
            Long originalAmount,
            Long discountAmount,
            Long memberCouponId
    ) {
        return Order.builder()
                .orderCode(orderCode)
                .member(member)
                .orderType(OrderType.CONTENT)
                .planId(null)
                .subscription(null)
                .content(content)
                .originalAmount(originalAmount)
                .discountAmount(discountAmount)
                .memberCouponId(memberCouponId)
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();
    }

    public void markPaid() {
        this.status = OrderStatus.PAID;
    }

    /**
     * 결제 완료 후 생성된 구독 연결 (SUBSCRIPTION 타입일 때만 사용)
     */
    public void linkSubscription(Subscription subscription) {
        if (this.orderType != OrderType.SUBSCRIPTION) {
            throw new IllegalStateException("SUBSCRIPTION 타입 주문만 구독을 연결할 수 있습니다.");
        }
        this.subscription = subscription;
    }
}


