package com.example.backend.contentreview.controller;

import com.example.backend.contentreview.dto.request.ContentReviewRequestDto;
import com.example.backend.contentreview.dto.response.ContentReviewResponseDto;
import com.example.backend.contentreview.service.ContentReviewService;
import com.example.backend.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<ContentReviewResponseDto> getReview(@PathVariable Long reviewId) {
        ContentReviewResponseDto response = contentReviewService.getReview(reviewId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ContentReviewResponseDto>> getReviewsByContent(@PathVariable Long contentId) {
        List<ContentReviewResponseDto> response = contentReviewService.getReviewsByContent(contentId);
        return ResponseEntity.ok(response);
    }
}