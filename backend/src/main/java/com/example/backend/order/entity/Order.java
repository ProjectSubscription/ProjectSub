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

    @ManyToOne(fetch = FetchType.LAZY)
    private Subscription subscription;

    @ManyToOne(fetch = FetchType.LAZY)
    private Content content;

    private Long amount;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private LocalDateTime createdAt;

    public static Order create(
            String orderCode,
            Member member,
            OrderType orderType,
            Subscription subscription,
            Content content,
            Long amount
    ) {
        return Order.builder()
                .orderCode(orderCode)
                .member(member)
                .orderType(orderType)
                .subscription(subscription)
                .content(content)
                .amount(amount)
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();
    }

    public void markPaid() {
        this.status = OrderStatus.PAID;
    }
}


