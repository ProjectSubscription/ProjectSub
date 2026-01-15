package com.example.backend.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // @PreAuthorize, @PostAuthorize 활성화
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // ✅ CORS 설정
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ✅ 모든 요청 허용
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )

                // ✅ CSRF 비활성화 (H2 Console 사용 시 필수)
                //todo: 배포 시 수정해야함.

                .csrf(csrf -> csrf.disable()
                )

                // ✅ H2 Console iframe 허용
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                )

                // ✅ formLogin 비활성화 (SPA는 커스텀 로그인 API 사용)
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                
                // ✅ 세션 관리 설정 (세션 생성 및 유지)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED)
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * AuthenticationManager Bean 등록
     * 커스텀 로그인 API에서 사용
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * CORS 설정
     * 프론트엔드(localhost:3000)에서 백엔드(localhost:8080)로의 요청 허용
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 허용할 Origin (프론트엔드 주소)
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000"
        ));
        
        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // 허용할 헤더
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // 인증 정보(쿠키) 포함 허용
        configuration.setAllowCredentials(true);
        
        // Preflight 요청 캐시 시간 (1시간)
        configuration.setMaxAge(3600L);
        
        // 모든 경로에 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}