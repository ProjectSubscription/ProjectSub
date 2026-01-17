package com.example.backend.coupon.entity;

import com.example.backend.global.entity.CreatedAtEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coupon_targets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class CouponTarget extends CreatedAtEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private CouponTargetType targetType;

    @Column(name = "target_id")
    private Long targetId;

    public static CouponTarget forAll(Coupon coupon, CouponTargetType targetType) {
        return CouponTarget.builder()
                .coupon(coupon)
                .targetType(targetType)
                .targetId(null)
                .build();
    }

    public static CouponTarget forSpecific(Coupon coupon, CouponTargetType targetType, Long targetId) {
        return CouponTarget.builder()
                .coupon(coupon)
                .targetType(targetType)
                .targetId(targetId)
                .build();
    }
}

