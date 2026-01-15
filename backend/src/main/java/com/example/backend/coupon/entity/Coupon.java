package com.example.backend.coupon.entity;

import com.example.backend.global.entity.CreatedAtEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class Coupon extends CreatedAtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private Integer discountValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_type", nullable = false)
    private RefundType refundType;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    public static Coupon create(
            String code,
            DiscountType discountType,
            Integer discountValue,
            RefundType refundType,
            LocalDateTime expiredAt
    ) {
        return Coupon.builder()
                .code(code)
                .discountType(discountType)
                .discountValue(discountValue)
                .refundType(refundType != null ? refundType : RefundType.RESTORE_ON_REFUND)
                .expiredAt(expiredAt)
                .build();
    }

    public boolean isExpired(LocalDateTime now) {
        return !expiredAt.isAfter(now);
    }
}

