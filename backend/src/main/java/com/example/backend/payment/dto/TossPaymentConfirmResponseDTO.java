package com.example.backend.payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 토스 페이먼츠 결제 승인 응답 DTO
 * 
 * 참고: 토스 페이먼츠 API 응답 구조에 맞춰 필드를 정의합니다.
 * Jackson이 JSON을 역직렬화할 수 있도록 @Setter 추가
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true) // 알 수 없는 필드는 무시
public class TossPaymentConfirmResponseDTO {
    @JsonProperty("paymentKey")
    private String paymentKey;
    
    @JsonProperty("orderId")
    private String orderId;
    
    @JsonProperty("orderName")
    private String orderName;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("totalAmount")
    private Long totalAmount;
    
    @JsonProperty("method")
    private String method;
    
    @JsonProperty("approvedAt")
    private String approvedAt; // 토스 페이먼츠는 ISO 8601 형식의 문자열 반환
    
    @JsonProperty("requestedAt")
    private String requestedAt; // 토스 페이먼츠는 ISO 8601 형식의 문자열 반환
}
