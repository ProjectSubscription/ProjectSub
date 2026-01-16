package com.example.backend.auth.oauth.service;

import com.example.backend.auth.oauth.entity.OAuthTempToken;
import com.example.backend.auth.oauth.repository.OAuthTempTokenRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.dto.request.CompleteOAuthProfileRequest;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OAuthTempTokenService {

    private final OAuthTempTokenRepository tokenRepository;
    private final MemberService memberService;

    // 토큰 유효 시간 (10분)
    private static final int TOKEN_EXPIRY_MINUTES = 10;

    /**
     * OAuth 임시 토큰 생성
     *
     * @param provider       OAuth 제공자 (google, kakao 등)
     * @param providerUserId OAuth 제공자의 사용자 ID
     * @param email          사용자 이메일
     * @return 생성된 토큰 문자열
     */
    public String createToken(String provider, String providerUserId, String email) {
        try {
            // 새 토큰 생성 (UUID)
            String token = UUID.randomUUID().toString();
            LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES);

            OAuthTempToken tempToken = OAuthTempToken.builder()
                    .token(token)
                    .provider(provider)
                    .providerUserId(providerUserId)
                    .email(email)
                    .expiryDate(expiryDate)
                    .build();

            tokenRepository.save(tempToken);

            log.info("OAuth 임시 토큰 생성: provider={}, email={}", provider, email);
            return token;
        } catch (DataIntegrityViolationException e) {
            log.warn("OAuth 임시 토큰 생성 실패 (중복): provider={}, email={}", provider, email);
            // 중복 발생 시 재시도 (매우 드문 경우)
            return createToken(provider, providerUserId, email);
        }
    }

    /**
     * 토큰 검증 및 정보 반환
     *
     * @param token 검증할 토큰
     * @return OAuthTempToken (검증 성공 시)
     * @throws BusinessException 토큰이 유효하지 않거나 만료된 경우
     */
    @Transactional(readOnly = true)
    public OAuthTempToken validateToken(String token) {
        OAuthTempToken tempToken = tokenRepository.findByTokenWithLock(token)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        if (!tempToken.isValid()) {
            throw new BusinessException(ErrorCode.TOKEN_EXPIRED);
        }
        return tempToken;
    }

    /**
     * 토큰 사용 처리 (일회용)
     *
     * @param token 사용할 토큰
     */
    public void markTokenAsUsed(String token) {
        OAuthTempToken tempToken = validateToken(token);
        tempToken.markAsUsed();
        log.info("OAuth 임시 토큰 사용 처리: token={}", token);
    }

    /**
     * 만료된 토큰 정리 (매일 자정 실행)
     */
    @Scheduled(cron = "0 0 0 * * *")  // 매일 00:00:00에 실행
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        tokenRepository.deleteByExpiryDateBefore(now);
        log.info("만료된 OAuth 임시 토큰 정리 완료");
    }

    public Member completeOAuthRegistration(String token, CompleteOAuthProfileRequest request) {
        log.info("OAuth 프로필 완성 요청");

        OAuthTempToken tempToken = validateToken(token);
        String eamil;
        if (tempToken.getEmail() == null) {
            eamil= request.getEmail();
        } else {
            eamil = tempToken.getEmail();
        }
        //====================
        // 회원 가입 및 프로필 완성
        Member member = memberService.registerOAuthMember(
                tempToken.getProvider(),
                tempToken.getProviderUserId(),
                eamil
        );
        log.info("member id = {}, tempToken provider = {}", member.getId(), tempToken.getProvider());
        Member completedMember = memberService.completeOAuthMemberProfile(member.getId(), request);
        //======================
        // 토큰 사용 처리
        markTokenAsUsed(token);
        return completedMember;
    }
}
