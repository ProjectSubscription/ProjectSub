package com.example.backend.contentreview.service;

import com.example.backend.content.entity.Content;
import com.example.backend.content.repository.ContentRepository;
import com.example.backend.contentreview.entity.ContentReview;
import com.example.backend.contentreview.dto.request.ContentReviewRequestDto;
import com.example.backend.contentreview.dto.response.ContentReviewResponseDto;
import com.example.backend.contentreview.repository.ContentReviewRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentReviewService {

    private final ContentReviewRepository contentReviewRepository;
    private final MemberService memberService;
    private final ContentRepository contentRepository;

    @Transactional
    public ContentReviewResponseDto createReview(Long contentId, ContentReviewRequestDto request) {

        if (contentReviewDupCheck(contentId, request.getMemberId())) {
            throw new BusinessException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        Member member = memberService.findRegisteredMemberById(request.getMemberId());

        // ContentService는 DTO만 반환하므로 엔티티 참조를 위해 Repository 직접 사용
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CONTENT_NOT_FOUND));

        ContentReview contentReview = ContentReview.create(content, member, request.getRating(), request.getComment());

        ContentReview savedReview = contentReviewRepository.save(contentReview);
        return new ContentReviewResponseDto(savedReview);
    }

    @Transactional
    public ContentReviewResponseDto updateReview(Long reviewId, ContentReviewRequestDto request) {
        ContentReview contentReview = findContentReviewById(reviewId);

        contentReview.update(request.getRating(), request.getComment());
        return new ContentReviewResponseDto(contentReview);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        ContentReview contentReview = findContentReviewById(reviewId);
        contentReview.changeDeleteStatus();
    }

    public ContentReviewResponseDto getReview(Long reviewId) {
        ContentReview contentReview = findContentReviewById(reviewId);
        return new ContentReviewResponseDto(contentReview);
    }

    public List<ContentReviewResponseDto> getReviewsByContent(Long contentId) {
        return contentReviewRepository.findByContentIdAndIsDeletedFalse(contentId).stream()
                .map(ContentReviewResponseDto::new)
                .collect(Collectors.toList());
    }

    public boolean contentReviewDupCheck(Long contentId, Long memberId) {
        return contentReviewRepository.existsByContentIdAndMemberIdAndIsDeletedFalse(contentId, memberId);
    }

    public ContentReview findContentReviewById(Long reviewId) {
        return contentReviewRepository.findById(reviewId)
                .orElseThrow(() -> new BusinessException(ErrorCode.REVIEW_NOT_FOUND));
    }
}