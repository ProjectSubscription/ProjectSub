package com.example.backend.auth.principal;

import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;

/**
 * OAuth / 일반 로그인 모두에서 동일하게 사용하는 Security Principal
 * - username: email
 * - authorities: Member.roles 기반
 */
public class MemberPrincipal implements UserDetails {

    private final Long memberId;
    private final String email;
    private final String nickname;
    private final String password; // 일반 로그인용( OAuth 회원은 null 가능 )
    private final Set<Role> roles;
    private final boolean profileCompleted;

    private MemberPrincipal(Long memberId, String email, String nickname, String password, Set<Role> roles, boolean profileCompleted) {
        this.memberId = memberId;
        this.email = email;
        this.nickname = nickname;
        this.password = password;
        this.roles = roles;
        this.profileCompleted = profileCompleted;
    }

    public static MemberPrincipal from(Member member) {
        return new MemberPrincipal(
                member.getId(),
                member.getEmail(),
                member.getNickname(),
                member.getPassword(),
                member.getRoles(),
                member.isProfileCompleted()
        );
    }

    public Long getMemberId() {
        return memberId;
    }

    public String getNickname() {
        return nickname;
    }

    public boolean isProfileCompleted() {
        return profileCompleted;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .toList();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}


