package com.example.backend.contentreviewcomment.service;

import com.example.backend.contentreview.domain.ContentReview;
import com.example.backend.contentreview.service.ContentReviewService;
import com.example.backend.contentreviewcomment.domain.ContentReviewComment;
import com.example.backend.contentreviewcomment.repository.ContentReviewCommentRepository;
import com.example.backend.contentreviewcomment.dto.request.ContentReviewCommentRequestDto;
import com.example.backend.contentreviewcomment.dto.response.ContentReviewCommentResponseDto;
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
public class ContentReviewCommentService {

    private final ContentReviewCommentRepository contentReviewCommentRepository;
    private final ContentReviewService contentReviewService;
    private final MemberService memberService;

    @Transactional
    public ContentReviewCommentResponseDto createComment(Long reviewId, ContentReviewCommentRequestDto request) {
        Member member = memberService.findMemberById(request.getMemberId());

        // URL에서 받은 reviewId를 사용
        ContentReview contentReview = contentReviewService.findContentReviewById(reviewId);

        ContentReviewComment parent = null;
        if (request.getParentId() != null) {
            parent = contentReviewCommentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
        }

        ContentReviewComment comment = ContentReviewComment.create(contentReview, member, request.getComment(), parent);
        ContentReviewComment savedComment = contentReviewCommentRepository.save(comment);
        return new ContentReviewCommentResponseDto(savedComment);
    }

    public ContentReviewCommentResponseDto getComment(Long commentId) {
        ContentReviewComment comment = contentReviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
        return new ContentReviewCommentResponseDto(comment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        ContentReviewComment comment = contentReviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
        comment.changeDeleteStatus();
    }

    @Transactional
    public ContentReviewCommentResponseDto updateComment(Long commentId, ContentReviewCommentRequestDto request) {
        ContentReviewComment comment = contentReviewCommentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

        comment.update(request.getComment());

        return new ContentReviewCommentResponseDto(comment);
    }

    public List<ContentReviewCommentResponseDto> getCommentsByReview(Long reviewId) {
        // 페치 조인이 포함된 메서드 호출 - 대댓글 관련 조회 시 DB에 너무 많이 접근함
        return contentReviewCommentRepository.findByContentReviewIdWithAllRelations(reviewId)
                .stream()
                .map(ContentReviewCommentResponseDto::new)
                .collect(Collectors.toList());
    }
}