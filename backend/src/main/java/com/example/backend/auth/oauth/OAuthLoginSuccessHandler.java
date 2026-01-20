package com.example.backend.auth.oauth;

import com.example.backend.auth.oauth.service.OAuthTempTokenService;
import com.example.backend.global.security.CustomUserDetails;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuthLoginSuccessHandler implements AuthenticationSuccessHandler {

    @Value("${app.frontend-base-url:http://52.79.142.181:3000}")
    private String frontendBaseUrl;
    private final MemberService memberService;
    private final OAuthTempTokenService oAuthTempTokenService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;

        CustomOAuth2User customOAuth2User = (CustomOAuth2User) oauthToken.getPrincipal();

        if (customOAuth2User.isMember()) {
            Member member = memberService.findRegisteredMemberByOAuth(customOAuth2User.getProvider(), customOAuth2User.getProviderUserId());

            // 세션 설정 (CustomUserDetails 사용)
            CustomUserDetails userDetails = new CustomUserDetails(
                    member.getId(),
                    member.getEmail(),
                    member.getPassword(),
                    member.getRoles()
            );

            Authentication oauthAuthentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );

            // SecurityContext에 저장
            SecurityContextHolder.getContext().setAuthentication(oauthAuthentication);

            // 세션에 SecurityContext 저장 (일반 로그인과 동일한 방식)
            HttpSession session = request.getSession(true);
            session.setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                    SecurityContextHolder.getContext()
            );
            log.info("successHandler session ID = {} ", session.getId());
            response.sendRedirect(frontendBaseUrl);
        } else {
            // 비회원인 경우 임시 토큰 생성하여 프론트엔드로 전달
            String token = oAuthTempTokenService.createToken(
                    customOAuth2User.getProvider(),
                    customOAuth2User.getProviderUserId(),
                    customOAuth2User.getEmail()
            );

            // 토큰과 이메일을 쿼리 파라미터로 전달
            String redirectUrl = frontendBaseUrl + "/members/oauth/complete-profile?token="
                    + URLEncoder.encode(token, StandardCharsets.UTF_8);
            
            // 이메일이 있는 경우 쿼리 파라미터에 추가
            if (customOAuth2User.getEmail() != null && !customOAuth2User.getEmail().isEmpty()) {
                redirectUrl += "&email=" + URLEncoder.encode(customOAuth2User.getEmail(), StandardCharsets.UTF_8);
            }
            
            response.sendRedirect(redirectUrl);
        }


    }
}