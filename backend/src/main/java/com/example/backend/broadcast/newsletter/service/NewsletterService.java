package com.example.backend.broadcast.newsletter.service;

import com.example.backend.broadcast.newsletter.dto.event.NewsletterPublishedEvent;
import com.example.backend.broadcast.newsletter.dto.request.NewsletterRequestDTO;
import com.example.backend.broadcast.newsletter.dto.response.NewsletterResponseDTO;
import com.example.backend.broadcast.newsletter.entity.Newsletter;
import com.example.backend.broadcast.newsletter.entity.NewsletterStatus;
import com.example.backend.broadcast.newsletter.repository.NewsletterRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class NewsletterService {

    private final NewsletterRepository newsletterRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    // 상태별 조회
    @Transactional(readOnly = true)
    public Page<NewsletterResponseDTO> getNewsletters(Pageable pageable, NewsletterStatus status) {
        return newsletterRepository.findAllByStatusAndIsDeletedFalse(status, pageable)
                .map(NewsletterResponseDTO::create);
    }

    // 전체리스트 조회
    @Transactional(readOnly = true)
    public Page<NewsletterResponseDTO> getAllNewsletters(Pageable pageable) {
        return newsletterRepository.findAllByIsDeletedFalse(pageable)
                .map(NewsletterResponseDTO::create);
    }

    // 상세조회
    @Transactional(readOnly = true)
    public NewsletterResponseDTO getNewsletter(Long id) {

        log.info("뉴스레터 상세조회 - id={}", id);

        Newsletter newsletter = newsletterRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NEWSLETTER_NOT_FOUND));

        if (newsletter.isDeleted() || !newsletter.isPublished()) {
            log.error("뉴스레터 발행중이지 않습니다 - isPublished={}", newsletter.isPublished());
            throw new BusinessException(ErrorCode.NEWSLETTER_NOT_PUBLISHED);
        }

        return NewsletterResponseDTO.create(newsletter);
    }

    // 관리자용 상세조회 (모든 상태 조회 가능)
    @Transactional(readOnly = true)
    public NewsletterResponseDTO getNewsletterForAdmin(Long id) {
        log.info("뉴스레터 관리자 상세조회 - id={}", id);

        Newsletter newsletter = newsletterRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NEWSLETTER_NOT_FOUND));

        if (newsletter.isDeleted()) {
            log.error("이미 삭제된 뉴스레터입니다.");
            throw new BusinessException(ErrorCode.NEWSLETTER_ALREADY_DELETED);
        }
        return NewsletterResponseDTO.create(newsletter);
    }

    // 생성
    public NewsletterResponseDTO create(NewsletterRequestDTO dto) {

        log.info("뉴스레터 생성 start - title={}", dto.getTitle());

        Newsletter newsletter = Newsletter.create(dto);

        Newsletter saved = newsletterRepository.save(newsletter);

        log.info("뉴스레터 생성 성공 - id={}", saved.getId());

        return NewsletterResponseDTO.create(saved);
    }

    // 수정
    public NewsletterResponseDTO update(NewsletterRequestDTO dto, Long id) {
        log.info("뉴스레터 수정 start - title={}", dto.getTitle());

        Newsletter newsletter = newsletterRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NEWSLETTER_NOT_FOUND));

        if (newsletter.isDeleted() || newsletter.isPublished()) {
            log.error("발행 전에만 수정가능합니다. - isPublished={}", newsletter.isPublished());
            throw new BusinessException(ErrorCode.NEWSLETTER_UPDATE_FORBIDDEN);
        }

        newsletter.update(dto);

        return NewsletterResponseDTO.create(newsletter);
    }

    // 발행
    public void publish(Long id) {
        log.info("뉴스레터 발행 start - id={}", id);

        Newsletter newsletter = newsletterRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NEWSLETTER_NOT_FOUND));

        // 중복 발행 방지
        if (newsletter.getStatus() == NewsletterStatus.PUBLISHED) {
            log.error("이미 발행된 뉴스레터입니다. - status={}", newsletter.getStatus());
            throw new BusinessException(ErrorCode.NEWSLETTER_ALREADY_PUBLISHED);
        }

        // 소프트 삭제처리 된 뉴스레터는 재발행 불가
        if (newsletter.isDeleted()) {
            log.error("이미 삭제된 뉴스레터입니다. isDeleted={}", newsletter.isDeleted());
            throw new BusinessException(ErrorCode.NEWSLETTER_ALREADY_DELETED);
        }

        newsletter.publish();

        // 알림 이벤트 발행
        applicationEventPublisher.publishEvent(
                NewsletterPublishedEvent.create(id, newsletter.getTitle())
        );
    }

    // 보관
    public void archive(Long id) {
        log.info("뉴스레터 보관(숨김) start - id={}", id);

        Newsletter newsletter = newsletterRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NEWSLETTER_NOT_FOUND));

        newsletter.archive();

        log.info("뉴스레터 보관 성공 - status={}", newsletter.getStatus());

    }

    // 소프트 삭제
    public void softDelete(Long id) {
        log.info("뉴스레터 소프트 삭제 - id={}", id);

        Newsletter newsletter = newsletterRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NEWSLETTER_NOT_FOUND));

        newsletter.softDelete();

        log.info("뉴스레터 소프트 삭제 성공 - isDeleted={}", newsletter.isDeleted());

    }
}
