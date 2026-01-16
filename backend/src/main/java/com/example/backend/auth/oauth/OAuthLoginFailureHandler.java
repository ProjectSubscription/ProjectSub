package com.example.backend.auth.oauth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * OAuth 로그인 실패 시 처리
 * - 기본 로그인 페이지(/login)로 리다이렉트
 * - 에러 코드를 쿼리로 전달해서 프론트/페이지에서 메시지 매핑 가능
 */
@Component
public class OAuthLoginFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.frontend-base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {

        if (exception instanceof OAuth2AuthenticationException oauth2Ex) {
            String code = oauth2Ex.getError().getErrorCode();
            response.sendRedirect(frontendBaseUrl + "/login?error&code=" + urlEncode(code));
            return;
        }

        response.sendRedirect(frontendBaseUrl + "/login?error");
    }

    private String urlEncode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}


