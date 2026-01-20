package com.example.backend.payment.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * 결제 관련 설정
 */
@Configuration
public class PaymentConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
