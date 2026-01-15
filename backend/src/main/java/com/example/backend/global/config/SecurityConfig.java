package com.example.backend.global.config;

import com.example.backend.auth.security.ApiAuthenticationEntryPoint;
import com.example.backend.auth.oauth.CustomOAuth2UserService;
import com.example.backend.auth.oauth.OAuthLoginFailureHandler;
import com.example.backend.auth.oauth.OAuthLoginSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.RequestMatcher;

@Configuration
@EnableWebSecurity

public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CustomOAuth2UserService customOAuth2UserService,
            OAuthLoginSuccessHandler oAuthLoginSuccessHandler,
            OAuthLoginFailureHandler oAuthLoginFailureHandler,
            ApiAuthenticationEntryPoint apiAuthenticationEntryPoint
    ) throws Exception {

        http
                // 권한 설정 (임시 회원 고려)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/oauth2/**",
                                "/error"
                        ).permitAll()
                        // 회원가입은 비로그인 허용
                        .requestMatchers(HttpMethod.POST, "/api/members/register").permitAll()

                        // 공개 조회는 허용 (나머지 /api/** 는 기본적으로 인증 필요)
                        .requestMatchers(HttpMethod.GET, "/api/channels/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/contents/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/channels/*/plans").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/channels/*/plans/**").permitAll()

                        // Role 기반 접근제어
                        .requestMatchers(HttpMethod.POST, "/api/channels/**").hasAnyRole("CREATOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/channels/**").hasAnyRole("CREATOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/channels/**").hasAnyRole("CREATOR", "ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/contents/**").hasAnyRole("CREATOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/contents/**").hasAnyRole("CREATOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/contents/**").hasAnyRole("CREATOR", "ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/channels/*/plans").hasAnyRole("CREATOR", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/channels/*/plans/**").hasAnyRole("CREATOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/channels/*/plans/**").hasAnyRole("CREATOR", "ADMIN")

                        .anyRequest().authenticated()
                )

                // OAuth 로그인 설정
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuthLoginSuccessHandler)
                        .failureHandler(oAuthLoginFailureHandler)
                )

                .exceptionHandling(ex -> ex
                        .defaultAuthenticationEntryPointFor(
                                apiAuthenticationEntryPoint,
                                apiRequestMatcher()
                        )
                )

                // ✅ CSRF 비활성화 (H2 Console 사용 시 필수)
                //todo: 배포 시 수정해야함.

                .csrf(csrf -> csrf.disable()
                )

                // ✅ H2 Console iframe 허용
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                )

                // ✅ 기본 로그인, 로그아웃 전부 비활성
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }

    private RequestMatcher apiRequestMatcher() {
        return request -> {
            String uri = request.getRequestURI();
            return uri != null && uri.startsWith("/api/");
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}