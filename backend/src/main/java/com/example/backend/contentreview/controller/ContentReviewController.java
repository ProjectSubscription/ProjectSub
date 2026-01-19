package com.example.backend.contentreview.controller;

import com.example.backend.contentreview.dto.request.ContentReviewRequestDto;
import com.example.backend.contentreview.dto.response.ContentReviewResponseDto;
import com.example.backend.contentreview.dto.response.TopReviewWithContentResponseDto;
import com.example.backend.contentreview.service.ContentReviewService;
import com.example.backend.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contents/{contentId}/reviews")
@RequiredArgsConstructor
public class ContentReviewController {

    private final ContentReviewService contentReviewService;

    @PostMapping
    public ResponseEntity<ContentReviewResponseDto> createReview(
            @PathVariable Long contentId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ContentReviewRequestDto request) {

        ContentReviewResponseDto response = contentReviewService.createReview(contentId, userDetails.getMemberId(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ContentReviewResponseDto> updateReview(@PathVariable Long reviewId, @RequestBody ContentReviewRequestDto request) {
        ContentReviewResponseDto response = contentReviewService.updateReview(reviewId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        contentReviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<ContentReviewResponseDto> getReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long memberId = userDetails != null ? userDetails.getMemberId() : null;
        ContentReviewResponseDto response = contentReviewService.getReview(reviewId, memberId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ContentReviewResponseDto>> getReviewsByContent(
            @PathVariable Long contentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long memberId = userDetails != null ? userDetails.getMemberId() : null;
        List<ContentReviewResponseDto> response = contentReviewService.getReviewsByContent(contentId, memberId);
        return ResponseEntity.ok(response);
    }

    /**
     * 리뷰 추천 토글 (추천/추천 취소)
     * POST /api/contents/{contentId}/reviews/{reviewId}/like
     */
    @PostMapping("/{reviewId}/like")
    public ResponseEntity<Map<String, Object>> toggleReviewLike(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean isLiked = contentReviewService.toggleReviewLike(reviewId, userDetails.getMemberId());
        return ResponseEntity.ok(Map.of("isLiked", isLiked));
    }
}