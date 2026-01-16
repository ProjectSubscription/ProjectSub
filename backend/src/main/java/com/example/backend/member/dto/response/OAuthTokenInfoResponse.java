package com.example.backend.member.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OAuthTokenInfoResponse {
    private String provider;
    private String providerUserId;
    private String email;
}
