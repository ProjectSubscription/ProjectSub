package com.example.backend.settlement.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settlements")
@Slf4j
public class SettlementBatchController {

    private final JobLauncher jobLauncher;
    private final Job settlementJob;

    public SettlementBatchController(
            JobLauncher jobLauncher,
            @Qualifier("settlementJob") Job settlementJob
    ) {
        this.jobLauncher = jobLauncher;
        this.settlementJob = settlementJob;
    }

    /**
     * 관리자용: 정산 배치 수동 실행
     * POST /api/admin/settlements/batch
     */
    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> runSettlementBatch() {
        try {
            log.info("관리자용 정산 배치 수동 실행 요청");

            // Job 실행에 필요한 파라미터 생성 (중복 실행 방지)
            JobParameters jobParameters = new JobParametersBuilder()
                    .addLong("timestamp", System.currentTimeMillis())
                    .toJobParameters();

            jobLauncher.run(settlementJob, jobParameters);

            log.info("관리자용 정산 배치 수동 실행 완료");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "정산 배치가 실행되었습니다."
            ));
        } catch (Exception e) {
            log.error("관리자용 정산 배치 실행 실패: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "정산 배치 실행 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
}

