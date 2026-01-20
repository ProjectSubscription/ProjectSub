package com.example.backend.auth.oauth.entity;

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
@Table(name = "oauth_temp_tokens")
public class OAuthTempToken extends CreatedAtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;  // UUID로 생성될 일회용 토큰

    @Column(nullable = false)
    private String provider;  // OAuth 제공자 (google, kakao 등)

    @Column(nullable = false)
    private String providerUserId;  // OAuth 제공자의 사용자 ID

    @Column(nullable = true)
    private String email;  // 사용자 이메일

    @Column(nullable = false)
    private LocalDateTime expiryDate;  // 만료 시간 (보통 10분~15분)

    @Column(nullable = false)
    private boolean used = false;  // 사용 여부 (일회용이니까)

    @Builder
    public OAuthTempToken(String token, String provider, String providerUserId, String email, LocalDateTime expiryDate) {
        this.token = token;
        this.provider = provider;
        this.providerUserId = providerUserId;
        this.email = email;
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
