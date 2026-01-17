package com.example.backend.coupon.service;

import com.example.backend.coupon.repository.CouponRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
@RequiredArgsConstructor
public class CouponCodeGenerator {
    private static final String CHAR_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 12;
    private static final int MAX_RETRY = 10;

    private final CouponRepository couponRepository;
    private final SecureRandom random = new SecureRandom();

    public String generateUniqueCode() {
        for (int i = 0; i < MAX_RETRY; i++) {
            String code = generateRawCode();
            if (!couponRepository.existsByCodeIgnoreCase(code)) {
                return code;
            }
        }
        // 여러 번 재시도해도 중복이 나는 경우
        throw new BusinessException(ErrorCode.COUPON_CODE_DUPLICATED);
    }

    private String generateRawCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            int idx = random.nextInt(CHAR_POOL.length());
            sb.append(CHAR_POOL.charAt(idx));
        }
        return sb.toString();
    }
}

