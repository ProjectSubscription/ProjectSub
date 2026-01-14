package com.example.backend.content.repository;

import com.example.backend.content.entity.ContentLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentLikeRepository extends JpaRepository<ContentLike, Long> {
    boolean existsContentLikeByContentIdAndMemberId(Long contentId, Long memberId);

    void deleteContentLikeByContentIdAndMemberId(Long contentId, Long memberId);
}
