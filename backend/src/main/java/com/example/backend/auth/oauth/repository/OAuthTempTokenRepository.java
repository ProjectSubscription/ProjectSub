package com.example.backend.auth.oauth.repository;

import com.example.backend.auth.oauth.entity.OAuthTempToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OAuthTempTokenRepository extends JpaRepository<OAuthTempToken, Long> {

    // 토큰으로 찾기 (프론트엔드에서 검증 요청 시)
    Optional<OAuthTempToken> findByToken(String token);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from OAuthTempToken t where t.token = :token")
    Optional<OAuthTempToken> findByTokenWithLock(@Param("token") String token);

    // 만료된 토큰 삭제 (정리용)
    void deleteByExpiryDateBefore(LocalDateTime now);
}
