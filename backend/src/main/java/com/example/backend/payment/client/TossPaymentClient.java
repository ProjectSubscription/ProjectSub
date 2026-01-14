package com.example.backend.payment.client;

import com.example.backend.payment.dto.TossPaymentConfirmRequestDTO;
import com.example.backend.payment.dto.TossPaymentConfirmResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * 토스 페이먼츠 API 클라이언트
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TossPaymentClient {

    private final RestTemplate restTemplate;

    @Value("${toss.payments.secret-key}")
    private String secretKey;

    @Value("${toss.payments.base-url}")
    private String baseUrl;

    /**
     * 결제 승인 요청
     * POST /v1/payments/confirm
     */
    public TossPaymentConfirmResponseDTO confirmPayment(TossPaymentConfirmRequestDTO request) {
        String url = baseUrl + "/v1/payments/confirm";

        HttpHeaders headers = createHeaders();
        HttpEntity<TossPaymentConfirmRequestDTO> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<TossPaymentConfirmResponseDTO> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    TossPaymentConfirmResponseDTO.class
            );

            TossPaymentConfirmResponseDTO responseBody = response.getBody();
            if (responseBody == null) {
                throw new RuntimeException("토스 페이먼츠 응답이 null입니다.");
            }

            log.info("결제 승인 요청 성공: orderId={}, paymentKey={}, status={}", 
                    request.getOrderId(), request.getPaymentKey(), responseBody.getStatus());
            return responseBody;
        } catch (HttpClientErrorException e) {
            log.error("결제 승인 요청 실패 (HTTP 에러): orderId={}, paymentKey={}, status={}, body={}",
                    request.getOrderId(), request.getPaymentKey(), e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("결제 승인 요청에 실패했습니다: " + e.getResponseBodyAsString(), e);
        } catch (RestClientException e) {
            // JSON 파싱 오류 등
            log.error("결제 승인 요청 실패 (파싱 오류): orderId={}, paymentKey={}, error={}, message={}",
                    request.getOrderId(), request.getPaymentKey(), e.getClass().getSimpleName(), e.getMessage());
            throw new RuntimeException("결제 승인 응답을 파싱하는데 실패했습니다: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("결제 승인 요청 실패: orderId={}, paymentKey={}, error={}, cause={}",
                    request.getOrderId(), request.getPaymentKey(), e.getMessage(), e.getCause());
            throw new RuntimeException("결제 승인 요청에 실패했습니다.", e);
        }
    }

    /**
     * HTTP 헤더 생성 (인증 정보 포함)
     * 토스 페이먼츠는 Authorization 헤더에 "Basic {base64(secretKey:)}" 형식 사용
     * 시크릿 키 뒤에 콜론(:)을 추가하여 비밀번호가 없음을 표시
     * 
     * 참고: Basic base64("{WIDGET_SECRET_KEY}:")
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // 시크릿 키와 콜론(:)을 base64로 인코딩
        // 콜론(:)을 반드시 포함해야 함 (비밀번호가 없음을 표시)
        String auth = secretKey + ":";
        String encodedAuth = java.util.Base64.getEncoder().encodeToString(auth.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + encodedAuth);
        
        return headers;
    }
}
