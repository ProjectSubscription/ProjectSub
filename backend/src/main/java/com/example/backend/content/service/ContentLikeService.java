package com.example.backend.content.service;

import com.example.backend.content.entity.Content;
import com.example.backend.content.entity.ContentLike;
import com.example.backend.content.repository.ContentLikeRepository;
import com.example.backend.content.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ContentLikeService {

    private final ContentRepository contentRepository;
    private final ContentLikeRepository contentLikeRepository;

    public void like(Long contentId, Long memberId) {

        log.info("like request - contentId={}, memberId={}", contentId, memberId);

        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("콘텐츠를 찾을 수 없습니다.")); // todo: ErrorCode 추가되면 변경

        if (contentLikeRepository.existsContentLikeByContentIdAndMemberId(contentId, memberId)) {
            log.error("좋아요 중복 요청 시도 - contentId={}, memberId={}", contentId, memberId);
            throw new RuntimeException("이미 좋아요를 누른 게시물입니다."); // todo: ErrorCode 추가되면 변경
        }

        ContentLike contentLike = ContentLike.create(contentId, memberId);
        contentLikeRepository.save(contentLike);

        // 좋아요 증가
        content.increaseLikeCount();

        log.info("like increase success - likeCount={}", content.getLikeCount());
    }

    public void deleteLike(Long contentId, Long memberId) {

        log.info("like delete request - contentId={}, memberId={}", contentId, memberId);

        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("콘텐츠를 찾을 수 없습니다.")); // todo: ErrorCode 추가되면 변경

        if (!contentLikeRepository.existsContentLikeByContentIdAndMemberId(contentId, memberId)) {
            log.error("존재하지 않는 좋아요 삭제 요청 - contentId={}, memberId={}", contentId, memberId);
            throw new RuntimeException("좋아요를 누른 이력이 존재하지 않습니다."); // todo: ErrorCode 추가되면 변경
        }

        contentLikeRepository.deleteContentLikeByContentIdAndMemberId(contentId, memberId);

        // 좋아요 감소
        content.decreaseLikeCount();

        log.info("like decrease success - likeCount={}", content.getLikeCount());
    }

    public boolean isLiked(Long contentId, Long memberId) {
        return contentLikeRepository.existsContentLikeByContentIdAndMemberId(contentId, memberId);
    }
}
