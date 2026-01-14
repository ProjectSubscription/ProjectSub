package com.example.backend.member.entity;

import com.example.backend.global.entity.CreatedAtEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "password_reset_tokens")
public class PasswordResetToken extends CreatedAtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;  // UUID로 생성될 일회용 토큰

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    private Member member;  // 어떤 회원의 토큰인지

    @Column(nullable = false)
    private LocalDateTime expiryDate;  // 만료 시간 (보통 15분~1시간)

    @Column(nullable = false)
    private boolean used = false;  // 사용 여부 (일회용이니까)

    //todo: 수정해야함.
    @Builder
    public PasswordResetToken(String token, Member member, LocalDateTime expiryDate) {
        this.token = token;
        this.member = member;
        this.expiryDate = expiryDate;
        this.used = false;
    }

    // 토큰 만료 여부 확인
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }

    // 토큰 사용 처리
    public void markAsUsed() {
        this.used = true;
    }

    // 토큰 유효성 검증
    public boolean isValid() {
        return !isExpired() && !used;
    }
}