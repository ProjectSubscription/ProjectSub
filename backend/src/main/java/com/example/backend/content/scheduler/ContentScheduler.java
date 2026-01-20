package com.example.backend.content.scheduler;

import com.example.backend.content.service.ContentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 콘텐츠 예약 발행 스케줄러
 * 주기적으로 예약 발행 시간이 된 콘텐츠를 확인하고 처리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ContentScheduler {

    private final ContentService contentService;

    /**
     * 예약 발행 처리
     * 매 분마다 실행 (cron: 초 분 시 일 월 요일)
     */
    @Scheduled(cron = "0 * * * * *") // 매 분마다 실행
    public void processScheduledPublications() {
        try {
            log.info("예약 발행 처리 시작");
            contentService.processScheduledPublications();
            log.info("예약 발행 처리 완료");
        } catch (Exception e) {
            log.error("예약 발행 처리 중 오류 발생", e);
        }
    }
}
