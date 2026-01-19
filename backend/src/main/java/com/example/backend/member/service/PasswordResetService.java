package com.example.backend.member.service;

import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.PasswordResetTokenInfo;
import com.example.backend.member.repository.PasswordResetTokenRedisRepository;
import com.example.backend.member.repository.PasswordTokenIndexRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetService {
    //todo: 상수 env 파일로 옮기기, AWS SES
    private final JavaMailSender mailSender;  // 이메일 발송용

    @Value("${PASSWORD_RESET_LINK}")
    private String resetLink;
    private final Duration TTL = Duration.ofMinutes(15);
    private final PasswordResetTokenRedisRepository tokenRedisRepository;
    private final PasswordTokenIndexRepository passwordTokenIndexRepository;

    /**
     * 비밀번호 재설정 이메일 발송
     */
    public void sendPasswordResetEmail(Member member) {
        log.info("### sendPasswordResetEmail called. memberId={}", member.getId());

        //1. 기존 토큰 삭제 (존재 시)
        Long memberId = member.getId();
        log.info("before index find");
        String oldToken = passwordTokenIndexRepository.findByMemberId(memberId);
        log.info("after index find. oldToken={}", oldToken);
        if (oldToken != null) {
            tokenRedisRepository.delete(oldToken);
            passwordTokenIndexRepository.delete(memberId);
            log.info("기존 토큰 삭제: memberId={}", memberId);
        }

        //2. 새 토큰 생성 (UUID));
        String token = UUID.randomUUID().toString();
        PasswordResetTokenInfo resetToken = new PasswordResetTokenInfo(memberId);
        log.info("### Redis save start. token={}", token);
        tokenRedisRepository.save(token, resetToken, TTL);
        log.info("### Redis save end");
        passwordTokenIndexRepository.save(memberId, token, TTL);

        // 3. 이메일 발송
        //String resetLink = "http://localhost:3000/password-reset?token=" + token;
        String resetLinkWithToken = resetLink + "?token" + token;
        sendEmail(member.getEmail(), resetLinkWithToken);

        log.info("비밀번호 재설정 이메일 발송: {}", member.getEmail());


    }

    /**
     * 비밀번호 재설정
     */
    public Long validateAndConsumeToken(String token) {
        // 토큰 검증. 검증 통과 시 resetToken 반환
        PasswordResetTokenInfo resetToken = validateToken(token);

        // 토큰 사용 처리
        Long memberId = resetToken.getMemberId();
        log.info("### Redis delete start. token={}", token);
        tokenRedisRepository.delete(token);
        passwordTokenIndexRepository.delete(memberId);
        log.info("### Redis delete end. token={}", token);
        log.info("비밀번호 리셋 토큰 삭제 완료: memberId = {}", memberId);
        return memberId;
    }

    /**
     * 토큰 검증
     */
    private PasswordResetTokenInfo validateToken(String token) {
        log.info("redis validate token now");
        PasswordResetTokenInfo passwordResetTokenInfo = tokenRedisRepository.find(token);
        if (passwordResetTokenInfo == null) {
            throw new BusinessException(ErrorCode.INVALID_OR_EXPIRED_TOKEN);
        }
        return passwordResetTokenInfo;
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


}