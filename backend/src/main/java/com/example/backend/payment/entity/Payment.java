package com.example.backend.payment.entity;

import com.example.backend.order.entity.Order;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="payments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Order order;

    @Enumerated(EnumType.STRING)
    private PgProvider pgProvider;

    @Column(unique = true)
    private String paymentKey;

    private Long amount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;

    public static Payment create(
            Order order,
            PgProvider pgProvider,
            String paymentKey,
            Long amount
    ) {
        return Payment.builder()
                .order(order)
                .pgProvider(pgProvider)
                .paymentKey(paymentKey)
                .amount(amount)
                .status(PaymentStatus.READY)
                .requestedAt(LocalDateTime.now())
                .build();
    }

    public void markPaid() {
        this.status = PaymentStatus.PAID;
        this.approvedAt = LocalDateTime.now();
    }

    public void markFailed() {
        this.status = PaymentStatus.FAILED;
    }

    public void markCancelled() {
        this.status = PaymentStatus.CANCELLED;
    }
}

