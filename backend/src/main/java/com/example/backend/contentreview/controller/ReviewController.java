package com.example.backend.contentreview.controller;

import com.example.backend.contentreview.dto.response.TopReviewWithContentResponseDto;
import com.example.backend.contentreview.service.ContentReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 리뷰 관련 공통 API 컨트롤러
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ContentReviewService contentReviewService;

    /**
     * 가장 추천이 많은 리뷰 조회 (콘텐츠 정보 포함)
     * GET /api/reviews/top?limit=5
     */
    @GetMapping("/top")
    public ResponseEntity<List<TopReviewWithContentResponseDto>> getTopReviews(
            @RequestParam(defaultValue = "5") int limit) {
        List<TopReviewWithContentResponseDto> response = contentReviewService.getTopReviewsByLikeCount(limit);
        return ResponseEntity.ok(response);
    }
}
