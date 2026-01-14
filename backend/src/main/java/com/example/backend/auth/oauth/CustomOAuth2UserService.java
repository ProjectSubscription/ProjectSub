package com.example.backend.auth.oauth;

import com.example.backend.auth.facade.AuthMemberFacade;
import com.example.backend.auth.oauth.attributes.OAuthAttributes;
import com.example.backend.auth.oauth.attributes.OAuthAttributesFactory;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final AuthMemberFacade  authMemberFacade;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException{
        //OAuth 제공자로부터 사용자 정보 조회
        OAuth2User oAuth2User = super.loadUser(userRequest);

        //OAuth provider 식별
        String provider=userRequest.getClientRegistration().getRegistrationId();

        //provider별 attribute 정규화
        OAuthAttributes attributes= OAuthAttributesFactory.of(provider,oAuth2User.getAttributes());

        String providerUserId= attributes.getProviderUserId();
        String email= attributes.getEmail();


        //OAuth 사용자에 대응되는 Member 보장
        try {
            // 이미 가입된 OAuth 회원인지 확인
            authMemberFacade.findByOAuth(provider, providerUserId);
        } catch (BusinessException e) {
            if (e.getErrorCode() != ErrorCode.MEMBER_NOT_FOUND) {
                throw e;
            }

            // 최초 OAuth 로그인 → 임시 회원 생성
            authMemberFacade.registerOAuthUser(
                    provider,
                    providerUserId,
                    email
            );
        }

        // OAuth2User는 그대로 반환
        return oAuth2User;
    }
}