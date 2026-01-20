package com.example.backend.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 스케줄링 설정
 * @Scheduled 어노테이션을 사용하기 위한 설정
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
