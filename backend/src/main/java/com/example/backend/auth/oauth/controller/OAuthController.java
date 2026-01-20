package com.example.backend.auth.oauth.controller;

import com.example.backend.auth.oauth.service.OAuthTempTokenService;
import com.example.backend.global.security.CustomUserDetails;
import com.example.backend.member.dto.request.CompleteOAuthProfileRequest;
import com.example.backend.member.dto.response.MyInfoResponse;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/oauth")
public class OAuthController {

    private final OAuthTempTokenService oAuthTempTokenService;
    private final MemberService memberService;

    /**
     * OAuth 프로필 완성 (추가 정보 입력)
     */
    @PostMapping("/complete-profile")
    public ResponseEntity<MyInfoResponse> completeOAuthProfile(
            @RequestParam String token,
            @Valid @RequestBody CompleteOAuthProfileRequest request,
            HttpServletRequest httpRequest) {
        Member completedMember = oAuthTempTokenService.completeOAuthRegistration(token,request);

        // 세션 설정 (CustomUserDetails 사용)
        CustomUserDetails userDetails = new CustomUserDetails(
                completedMember.getId(),
                completedMember.getEmail(),
                completedMember.getPassword(),
                completedMember.getRoles()
        );
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext()
        );

        log.info("OAuth 회원가입 완료: email={}, sessionId={}", completedMember.getEmail(), session.getId());

        return ResponseEntity.ok(MyInfoResponse.fromEntity(completedMember));
    }
}