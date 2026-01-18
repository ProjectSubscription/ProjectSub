package com.example.backend.content.service;

import com.example.backend.content.entity.ContentView;
import com.example.backend.content.repository.ContentViewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class ContentViewService {

    private final ContentViewRepository contentViewRepository;

    /**
     * 콘텐츠 조회 처리
     * - 최초 조회: row 생성
     * - 재조회: lastViewedAt 갱신
     */
    public void recordView(Long memberId, Long contentId) {
        ContentView view = contentViewRepository
                .findByMemberIdAndContentId(memberId, contentId)
                .orElseGet(() -> ContentView.create(memberId, contentId));

        view.updateLastViewedAt(LocalDateTime.now());

        contentViewRepository.save(view);
    }

    /**
     * 마지막 조회 시각 조회
     */
    @Transactional(readOnly = true)
    public LocalDateTime getLastViewedAt(Long memberId, Long contentId) {
        return contentViewRepository
                .findByMemberIdAndContentId(memberId, contentId)
                .map(ContentView::getLastViewedAt)
                .orElse(null);
    }
}
