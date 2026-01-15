package com.example.backend.member.controller;

import com.example.backend.member.dto.request.LoginRequest;
import com.example.backend.member.dto.response.MyInfoResponse;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

/**
 * 인증 관련 컨트롤러
 * SPA를 위한 REST API 방식 로그인
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final MemberService memberService;

    /**
     * 로그인 (JSON 요청/응답)
     */
    @PostMapping("/login")
    public ResponseEntity<MyInfoResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        log.info("로그인 요청: email={}", request.getEmail());

        try {
            // AuthenticationManager로 인증 처리
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            // SecurityContext에 인증 정보 저장
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 세션에 SecurityContext 저장 (명시적으로 세션에 저장)
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                    SecurityContextHolder.getContext()
            );

            // 사용자 정보 조회
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Member member = memberService.findRegisteredMemberByEmail(userDetails.getUsername());
            MyInfoResponse response = MyInfoResponse.fromEntity(member);

            log.info("로그인 성공: email={}, sessionId={}", request.getEmail(), session.getId());
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            log.warn("로그인 실패: 잘못된 이메일 또는 비밀번호 - email={}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("로그인 오류: email={}, error={}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 로그아웃 (세션 무효화)
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        
        String email = userDetails != null ? userDetails.getUsername() : "인증되지 않은 사용자";
        log.info("로그아웃 요청: email={}", email);

        // 세션 무효화
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            String sessionId = session.getId();
            session.invalidate();
            log.info("세션 무효화 완료: sessionId={}", sessionId);
        }

        // SecurityContext 초기화
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok().build();
    }
}
