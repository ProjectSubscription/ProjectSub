package com.example.backend.member.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;

@Repository
@RequiredArgsConstructor
public class PasswordTokenIndexRepository {

    private final StringRedisTemplate redisTemplate;
    private static final String PREFIX = "password-reset:member:";

    private String key(Long memberId) {
        return PREFIX + memberId;
    }

    public String findByMemberId(Long memberId) {
        return redisTemplate.opsForValue().get(key(memberId));
    }

    public void save(Long memberId, String token, Duration ttl) {
        redisTemplate.opsForValue().set(key(memberId), token, ttl);
    }

    public void delete(Long memberId) {
        redisTemplate.delete(key(memberId));
    }

}
