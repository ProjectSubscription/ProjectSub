package com.example.backend.auth.oauth.attributes;

import java.util.Map;

public class OAuthAttributesFactory {
    public static OAuthAttributes of(
            String provider,
            Map<String, Object> attributes
    ){
        return switch (provider){
            case "google"->new GoogleOAuthAttributes(attributes);
            case "kakao"->new KakaoOAuthAttributes(attributes);
            case "naver"->new NaverOAuthAttributes(attributes);
            default -> throw new IllegalArgumentException("Unsupported OAuth provider:  " + provider);
        };
    }
}
