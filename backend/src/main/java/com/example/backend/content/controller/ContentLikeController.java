package com.example.backend.content.controller;

import com.example.backend.content.service.ContentLikeService;
import com.example.backend.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contents")
@Slf4j
public class ContentLikeController {

    private final ContentLikeService contentLikeService;

    @PostMapping("/{contentId}/like")
    public ResponseEntity<Void> like(@PathVariable Long contentId,
                                  @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        log.info("like request start - contentId={}", contentId);

        Long memberId = customUserDetails.getMemberId();

        contentLikeService.like(contentId, memberId);

        log.info("like success - contentId={}", contentId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{contentId}/like")
    public ResponseEntity<Void> deleteLike(@PathVariable Long contentId,
                                           @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        log.info("like delete request start - contentId={}", contentId);

        Long memberId = customUserDetails.getMemberId();

        contentLikeService.deleteLike(contentId, memberId);

        log.info("like delete success - contentId={}", contentId);

        return ResponseEntity.noContent().build();
    }
}
