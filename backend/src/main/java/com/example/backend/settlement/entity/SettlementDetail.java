package com.example.backend.settlement.entity;

import com.example.backend.global.entity.CreatedAtEntity;
import com.example.backend.payment.entity.Payment;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "settlement_details")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class SettlementDetail extends CreatedAtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 정산 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "settlement_id", nullable = false)
    private Settlement settlement;

    /** 결제 내역 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    /** 해당 결제 금액 */
    @Column(nullable = false)
    private Long amount;

    public static SettlementDetail create(
            Settlement settlement,
            Payment payment,
            Long amount
    ) {
        return SettlementDetail.builder()
                .settlement(settlement)
                .payment(payment)
                .amount(amount)
                .build();
    }
}

