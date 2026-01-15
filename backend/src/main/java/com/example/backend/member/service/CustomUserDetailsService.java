package com.example.backend.member.service;

import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Spring Security UserDetailsService 구현
 * 로그인 시 사용자 정보를 조회하는 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberService memberService;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.info("사용자 인증 시도: email={}", email);

        try {
            // 이메일로 회원 조회
            Member member = memberService.findRegisteredMemberByEmail(email);

            // Role을 GrantedAuthority로 변환
            List<GrantedAuthority> authorities = member.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority(role.name()))
                    .collect(Collectors.toList());

            log.info("사용자 인증 성공: email={}, roles={}", email, member.getRoles());

            // Spring Security User 객체 생성
            return User.builder()
                    .username(member.getEmail())
                    .password(member.getPassword())
                    .authorities(authorities)
                    .accountExpired(false)
                    .accountLocked(false)
                    .credentialsExpired(false)
                    .disabled(false)
                    .build();

        } catch (Exception e) {
            log.error("사용자 인증 실패: email={}, error={}", email, e.getMessage());
            throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email, e);
        }
    }
}
