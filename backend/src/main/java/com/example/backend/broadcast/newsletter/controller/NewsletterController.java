package com.example.backend.broadcast.newsletter.controller;

import com.example.backend.broadcast.newsletter.dto.request.NewsletterRequestDTO;
import com.example.backend.broadcast.newsletter.dto.response.NewsletterResponseDTO;
import com.example.backend.broadcast.newsletter.service.NewsletterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api")
public class NewsletterController {

    private final NewsletterService newsletterService;

    // 발행된 공지 리스트 조회
    @GetMapping("/newsletters")
    public ResponseEntity<Page<NewsletterResponseDTO>> getNewsletters(
            @PageableDefault(sort = "publishedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<NewsletterResponseDTO> newsletters = newsletterService.getNewsletters(pageable);
        return ResponseEntity.ok(newsletters);
    }

    // 상세조회
    @GetMapping("/newsletters/{id}")
    public ResponseEntity<NewsletterResponseDTO> getNewsletter(@PathVariable Long id) {

        log.info("뉴스레터 상세조회 start - id={}", id);

        NewsletterResponseDTO newsletter = newsletterService.getNewsletter(id);
        return ResponseEntity.ok(newsletter);
    }

    // 생성
    @PostMapping("/admin/newsletters")
    public ResponseEntity<NewsletterResponseDTO> createNewsletter(@RequestBody @Valid NewsletterRequestDTO dto) {

        log.info("뉴스레터 생성 start - title={}", dto.getTitle());

        NewsletterResponseDTO newsletterResponseDTO = newsletterService.create(dto);

        log.info("뉴스레터 생성 완료 - id={}", newsletterResponseDTO.getNewsletterId());

        return ResponseEntity.status(HttpStatus.CREATED).body(newsletterResponseDTO);
    }

    // 수정
    @PutMapping("/admin/newsletters/{id}")
    public ResponseEntity<NewsletterResponseDTO> updateNewsletter(@PathVariable Long id,
                                              @RequestBody @Valid NewsletterRequestDTO dto) {

        NewsletterResponseDTO update = newsletterService.update(dto, id);

        log.info("뉴스레터 수정 성공 - id={}", id);

        return ResponseEntity.ok(update);
    }

    // 발행
    @PatchMapping("/admin/newsletters/{id}/publish")
    public ResponseEntity<Void> publishNewsletter(@PathVariable Long id) {

        log.info("뉴스레터 발행 start - id={}", id);

        newsletterService.publish(id);

        log.info("뉴스레터 발행 성공 - id={}", id);
        return ResponseEntity.noContent().build();

    }

    // 보관
    @PatchMapping("/admin/newsletters/{id}/archive")
    public ResponseEntity<Void> archiveNewsletter(@PathVariable Long id) {

        newsletterService.archive(id);

        log.info("뉴스레터 보관 성공 - id={}", id);

        return ResponseEntity.noContent().build();
    }

    // 삭제
    @DeleteMapping("/admin/newsletters/{id}")
    public ResponseEntity<Void> deleteNewsletter(@PathVariable Long id) {

        newsletterService.softDelete(id);

        log.info("뉴스레터 소프트 삭제 완료 - id={}", id);

        return ResponseEntity.noContent().build();
    }
}
