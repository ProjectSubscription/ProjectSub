package com.example.backend.auth.facade;

import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AuthMemberFacade {

    private final MemberService memberService;

    // OAuth 사용자 조회 ->
    public Member findByOAuth(String provider, String providerUserId) {
        return memberService.findRegisteredMemberByOAuth(provider, providerUserId);
    }

    // OAuth 임시 회원 생성
    public Member registerOAuthUser(String provider, String providerUserId, String email) {
        return memberService.registerOAuthMember(provider, providerUserId, email);
    }

    // 웹 로그인용
    public Optional<Member> findByEmail(String email) {
        try {
            return Optional.of(memberService.findRegisteredMemberByEmail(email));
        } catch (BusinessException e) {
            if (e.getErrorCode() == ErrorCode.MEMBER_NOT_FOUND) {
                return Optional.empty();
            }
            throw e;
        }
    }

    public boolean matchesPassword(String rawPassword, String encodedPassword) {
        return memberService.matchesPassword(rawPassword, encodedPassword);
    }
}