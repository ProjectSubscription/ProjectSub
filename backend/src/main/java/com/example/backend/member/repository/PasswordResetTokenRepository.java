package com.example.backend.member.repository;

import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.PasswordResetToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {

    // 토큰으로 찾기 (링크 클릭 시)
    Optional<PasswordResetToken> findByToken(String token);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PasswordResetToken p where p.token = :token")
    Optional<PasswordResetToken> findByTokenWithLock(@Param("token") String token);

    // 회원의 토큰 찾기
    Optional<PasswordResetToken> findByMember(Member member);

    // 만료된 토큰 삭제 (정리용)
    void deleteByExpiryDateBefore(LocalDateTime now);

    // 회원의 기존 토큰 삭제 (새로 발급 전)
    void deleteByMember(Member member);

}
