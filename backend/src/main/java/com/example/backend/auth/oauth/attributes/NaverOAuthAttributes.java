package com.example.backend.auth.oauth.attributes;

import java.util.Map;

public class NaverOAuthAttributes implements OAuthAttributes {
    private final Map<String, Object> attributes;

    public NaverOAuthAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getProvider() {
        return "naver";
    }

    @Override
    @SuppressWarnings("unchecked")
    public String getProviderUserId() {
        Map<String, Object> response =
                (Map<String, Object>) attributes.get("response");

        return response != null ? (String) response.get("id") : null;
    }

    @Override
    @SuppressWarnings("unchecked")
    public String getEmail() {
        Map<String, Object> response =
                (Map<String, Object>) attributes.get("response");

        return response != null ? (String) response.get("email") : null;
    }
}
