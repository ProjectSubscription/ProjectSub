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

    public boolean hasRole(Role role) {
        return roles.contains(role);
    }
}