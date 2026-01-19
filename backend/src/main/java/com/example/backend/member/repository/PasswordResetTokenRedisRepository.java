package com.example.backend.member.repository;

import com.example.backend.member.entity.PasswordResetTokenInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;

@Repository
@RequiredArgsConstructor
public class PasswordResetTokenRedisRepository {
    //Redis에 보조 인덱스를 둬서 유니크 제약
    private final String PREFIX = "password-reset:";
    private final RedisTemplate<String, PasswordResetTokenInfo> redisTemplate;

    private String key(String token) {
        return PREFIX + token;
    }

    public void save(String token, PasswordResetTokenInfo passwordResetTokenInfo,Duration TTL) {
        redisTemplate.opsForValue().set( key(token), passwordResetTokenInfo, TTL);
    }



    public PasswordResetTokenInfo find(String token) {
        return redisTemplate.opsForValue()
                .get(key(token));
    }

    public void delete(String token) {
        redisTemplate.delete(key(token));
    }



    /** RedisRepository 분기 조건
     * TTL이 다르다
     * 키 네이밍이 다르다
     * 접근 패턴이 다르다
     * 실패 허용 정책이 다르다
     */


}
