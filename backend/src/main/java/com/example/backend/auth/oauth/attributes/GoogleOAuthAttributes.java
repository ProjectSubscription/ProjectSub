package com.example.backend.auth.oauth.attributes;

import java.util.Map;

public class GoogleOAuthAttributes  implements OAuthAttributes {
    private final Map<String,Object> attributes;
    public GoogleOAuthAttributes(Map<String,Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getProvider(){
        return "google";
    }

    @Override
    public String getProviderUserId(){
        return (String) attributes.get("sub");
    }

    @Override
    public String getEmail(){
        return (String) attributes.get("email");
    }

}
