package com.example.backend.auth.oauth.attributes;

public interface OAuthAttributes {
    String getProvider();
    String getProviderUserId();
    String getEmail();
}
