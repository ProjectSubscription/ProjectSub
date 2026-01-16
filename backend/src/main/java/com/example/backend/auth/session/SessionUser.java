package com.example.backend.auth.session;

import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.Role;
import lombok.Getter;

import java.io.Serializable;
import java.util.Set;

@Getter
public class SessionUser implements Serializable {

    private final Long id;
    private final String email;
    private final String nickname;
    private final Set<Role> roles;
    private final boolean profileCompleted;

    private SessionUser(
            Long id,
            String email,
            String nickname,
            Set<Role> roles,
            boolean profileCompleted
    ) {
        this.id = id;
        this.email = email;
        this.nickname = nickname;
        this.roles = roles;
        this.profileCompleted = profileCompleted;
    }

    public static SessionUser from(Member member) {
        return new SessionUser(
                member.getId(),
                member.getEmail(),
                member.getNickname(),
                member.getRoles(),
                member.isProfileCompleted() // 임시회원 판단용
        );
    }

    /**
     * Member 엔티티 없이 세션 사용자 객체를 만들 때 사용 (일반 로그인 등)
     */
    public static SessionUser of(
            Long id,
            String email,
            String nickname,
            Set<Role> roles,
            boolean profileCompleted
    ) {
        return new SessionUser(id, email, nickname, roles, profileCompleted);
    }

    public boolean hasRole(Role role) {
        return roles.contains(role);
    }
}