package com.example.backend.contentreviewcomment.controller;

import com.example.backend.contentreviewcomment.dto.request.ContentReviewCommentRequestDto;
import com.example.backend.contentreviewcomment.dto.response.ContentReviewCommentResponseDto;
import com.example.backend.contentreviewcomment.service.ContentReviewCommentService;
import com.example.backend.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ContentReviewCommentController {

    private final ContentReviewCommentService contentReviewCommentService;

    // 1. 리뷰에 종속적인 생성 및 목록 조회
    @PostMapping("/api/reviews/{reviewId}/comments")
    public ResponseEntity<ContentReviewCommentResponseDto> createComment(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ContentReviewCommentRequestDto request) {
        return ResponseEntity.ok(contentReviewCommentService.createComment(reviewId, userDetails.getMemberId(), request));
    }

    @GetMapping("/api/reviews/{reviewId}/comments")
    public ResponseEntity<List<ContentReviewCommentResponseDto>> getCommentsByReview(@PathVariable Long reviewId) {
        return ResponseEntity.ok(contentReviewCommentService.getCommentsByReview(reviewId));
    }

    // 2. 개별 댓글에 대한 작업 (reviewId 없이 독립적인 경로로 분리)
    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        contentReviewCommentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/comments/{commentId}")
    public ResponseEntity<ContentReviewCommentResponseDto> getComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(contentReviewCommentService.getComment(commentId));
    }

    @PutMapping("/api/comments/{commentId}")
    public ResponseEntity<ContentReviewCommentResponseDto> updateComment(
            @PathVariable Long commentId,
            @RequestBody ContentReviewCommentRequestDto request) {
        ContentReviewCommentResponseDto response = contentReviewCommentService.updateComment(commentId, request);
        return ResponseEntity.ok(response);
    }
}