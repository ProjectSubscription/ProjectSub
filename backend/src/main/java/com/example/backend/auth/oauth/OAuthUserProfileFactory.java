package com.example.backend.auth.oauth;

import com.example.backend.auth.session.SessionUser;
import com.example.backend.member.entity.Role;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.stream.Collectors;

@Getter
public class OAuthUserProfileFactory {

    private final SessionUser sessionUser;

    public OAuthUserProfileFactory(SessionUser sessionUser) {
        this.sessionUser = sessionUser;
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return sessionUser.getRoles()
                .stream()
                .map(Role::name)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
    }
}