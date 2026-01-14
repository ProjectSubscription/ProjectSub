package com.example.backend.auth.oauth;

import com.example.backend.auth.oauth.attributes.OAuthAttributes;
import com.example.backend.auth.oauth.attributes.OAuthAttributesFactory;
import com.example.backend.auth.session.SessionKey;
import com.example.backend.auth.session.SessionUser;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuthLoginSuccessHandler implements AuthenticationSuccessHandler {

    private final MemberService memberService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String provider = oauthToken.getAuthorizedClientRegistrationId();

        OAuth2User oAuth2User = oauthToken.getPrincipal();
        OAuthAttributes attrs = OAuthAttributesFactory.of(provider, oAuth2User.getAttributes());
        String providerUserId = attrs.getProviderUserId();

        Member member = memberService.findRegisteredMemberByOAuth(provider, providerUserId);

        //SessionUser 생성
        SessionUser sessionUser = SessionUser.from(member);

        //Spring Security용 Authentication 생성
        Authentication newAuth =
                new UsernamePasswordAuthenticationToken(
                        sessionUser,
                        null,
                        member.getRoles().stream()
                                .map(role -> new SimpleGrantedAuthority(role.name()))
                                .toList()
                );

        //SecurityContext에 저장
        SecurityContextHolder.getContext().setAuthentication(newAuth);

        //HttpSession에도 저장 (선택이지만 유지 추천)
        HttpSession session = request.getSession(true);
        session.setAttribute(SessionKey.LOGIN_USER, sessionUser);

        //임시회원 분기
        if (!sessionUser.isProfileCompleted()) {
            response.sendRedirect("/members/oauth/complete-profile");
            return;
        }

        response.sendRedirect("/");
    }
}