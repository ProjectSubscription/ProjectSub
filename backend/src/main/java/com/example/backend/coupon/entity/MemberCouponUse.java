package com.example.backend.coupon.entity;

import com.example.backend.global.entity.CreatedAtEntity;
import com.example.backend.payment.entity.Payment;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "member_coupon_uses",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_member_coupon_use_unique_status",
                        columnNames = {"member_coupon_id", "status"}
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class MemberCouponUse extends CreatedAtEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_coupon_id", nullable = false)
    private MemberCoupon memberCoupon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @Column(name = "discount_amount", nullable = false)
    private Long discountAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberCouponUseStatus status;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    public static MemberCouponUse used(MemberCoupon memberCoupon, Payment payment, Long discountAmount) {
        return MemberCouponUse.builder()
                .memberCoupon(memberCoupon)
                .payment(payment)
                .discountAmount(discountAmount)
                .status(MemberCouponUseStatus.USED)
                .usedAt(LocalDateTime.now())
                .build();
    }

    public void cancel() {
        this.status = MemberCouponUseStatus.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
    }
}

