package com.example.backend.auth.resolver;

import com.example.backend.auth.session.SessionKey;
import com.example.backend.auth.session.SessionUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

public class LoginMemberArgumentResolver
        implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        // @LoginMember 붙어 있고
        // 타입이 Long 또는 SessionUser 인 경우 지원
        return parameter.hasParameterAnnotation(LoginMember.class)
                && (
                parameter.getParameterType().equals(Long.class)
                        || parameter.getParameterType().equals(SessionUser.class)
        );
    }

    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory
    ) {
        HttpServletRequest request =
                (HttpServletRequest) webRequest.getNativeRequest();

        HttpSession session = request.getSession(false);

        if (session == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }

        SessionUser sessionUser =
                (SessionUser) session.getAttribute(SessionKey.LOGIN_USER);

        if (sessionUser == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }

        // 파라미터 타입에 따라 반환
        if (parameter.getParameterType().equals(Long.class)) {
            return sessionUser.getId();
        }

        return sessionUser;
    }
}