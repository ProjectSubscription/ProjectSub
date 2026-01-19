package com.example.backend.global.config;

import com.example.backend.member.entity.PasswordResetTokenInfo;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, PasswordResetTokenInfo> passwordResetTokenRedisTemplate(RedisConnectionFactory cf) {
        RedisTemplate<String, PasswordResetTokenInfo> template = new RedisTemplate<>();
        template.setConnectionFactory(cf);

        // 키 ->  Redis 저장용 byte[] 변환
        StringRedisSerializer keySerializer = new StringRedisSerializer();

        // 밸류 Java 객체 → Redis 저장용 byte[] 변환
        GenericJackson2JsonRedisSerializer valueSerializer = new GenericJackson2JsonRedisSerializer();


        template.setKeySerializer(keySerializer);
        template.setHashKeySerializer(keySerializer);

        template.setValueSerializer(valueSerializer);
        template.setHashValueSerializer(valueSerializer);

        template.afterPropertiesSet();
        return template;
    }

}
