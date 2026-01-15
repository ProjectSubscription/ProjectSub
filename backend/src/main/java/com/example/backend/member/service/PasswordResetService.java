package com.example.backend.member.service;

import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.PasswordResetToken;
import com.example.backend.member.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetService {
    //todo: 상수 env 파일로 옮기기, AWS SES
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;  // 이메일 발송용

    // 토큰 유효 시간 (15분)
    private static final int TOKEN_EXPIRY_MINUTES = 15;

    /**
     * 비밀번호 재설정 이메일 발송
     */
    public void sendPasswordResetEmail(Member member) {

        try {
            //1. 기존 토큰 삭제
            tokenRepository.deleteByMember(member);
            tokenRepository.flush();
            log.info("기존 토큰 삭제: memberId={}", member.getId());

            //2. 새 토큰 생성 (UUID)
            String token = UUID.randomUUID().toString();
            LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .member(member)
                    .expiryDate(expiryDate)
                    .build();

            tokenRepository.save(resetToken);

            // 3. 이메일 발송
            String resetLink = "http://localhost:3000/password-reset?token=" + token;
            sendEmail(member.getEmail(), resetLink);

            log.info("비밀번호 재설정 이메일 발송: {}", member.getEmail());
        } catch (DataIntegrityViolationException e) {
            // 중복 요청 시에도 정상 처리 (보안상 동일한 응답)
            log.warn("중복 비밀번호 재설정 요청 감지: {}. 정상 응답으로 처리", member.getEmail());
            // 예외를 던지지 않음 → 정상적으로 처리된 것으로 간주
        }

    }

    /**
     * 비밀번호 재설정
     */
    public void resetPassword(String token, String newPassword, PasswordEncoder passwordEncoder) {
        // 토큰 검증. 검증 통과 시 resetToken 반환
        PasswordResetToken resetToken = validateToken(token);

        // 비밀번호 변경
        Member member = resetToken.getMember();
        member.resetPassword(newPassword, passwordEncoder);

        // 토큰 사용 처리 (일회용)
        resetToken.markAsUsed();

        log.info("비밀번호 재설정 완료: {}", member.getEmail());
    }

    /**
     * 토큰 검증
     */
    private PasswordResetToken validateToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByTokenWithLock(token)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        if (!resetToken.isValid()) {
            throw new BusinessException(ErrorCode.TOKEN_EXPIRED);
        }
        return resetToken;
    }

    /**
     * 이메일 발송
     */
    private void sendEmail(String to, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@yourapp.com");
        message.setTo(to);
        message.setSubject("비밀번호 재설정 안내");
        message.setText(
                "안녕하세요,\n\n" +
                        "비밀번호 재설정을 요청하셨습니다.\n\n" +
                        "아래 링크를 클릭하여 비밀번호를 재설정해주세요:\n" +
                        resetLink + "\n\n" +
                        "이 링크는 15분 동안 유효합니다.\n\n" +
                        "본인이 요청하지 않은 경우 무시하세요."
        );

        mailSender.send(message);  // 여기서 실제 발송!
    }

    /**
     * 만료된 토큰 정리 (매일 자정 실행)
     */
    @Scheduled(cron = "0 0 0 * * *")  // 매일 00:00:00에 실행
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        tokenRepository.deleteByExpiryDateBefore(now);
        log.info("만료된 비밀번호 재설정 토큰 정리 완료");
    }

}