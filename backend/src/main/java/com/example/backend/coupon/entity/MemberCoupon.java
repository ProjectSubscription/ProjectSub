package com.example.backend.coupon.entity;

import com.example.backend.global.entity.CreatedAtEntity;
import com.example.backend.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "member_coupons",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_member_coupon_member_coupon",
                        columnNames = {"member_id", "coupon_id"}
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class MemberCoupon extends CreatedAtEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberCouponStatus status;

    public static MemberCoupon issue(Member member, Coupon coupon) {
        return MemberCoupon.builder()
                .member(member)
                .coupon(coupon)
                .status(MemberCouponStatus.ISSUED)
                .build();
    }

    public boolean isIssued() {
        return this.status == MemberCouponStatus.ISSUED;
    }

    public void markUsed() {
        this.status = MemberCouponStatus.USED;
    }

    public void restore() {
        this.status = MemberCouponStatus.ISSUED;
    }
}

