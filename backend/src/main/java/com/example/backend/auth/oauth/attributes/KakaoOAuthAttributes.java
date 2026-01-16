package com.example.backend.auth.oauth.attributes;

import java.util.Map;

public class KakaoOAuthAttributes implements OAuthAttributes {
    private final Map<String, Object> attributes;

    public KakaoOAuthAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getProvider(){
        return "kakao";
    }

    @Override
    public String getProviderUserId(){
        return String.valueOf(attributes.get("id"));
    }

    @Override
    @SuppressWarnings("unchecked")
    public String getEmail() {
        Map<String, Object> account =
                (Map<String, Object>) attributes.get("kakao_account");

        if (account == null) {
            return null;
        }

        return (String) account.get("email");
    }
}
