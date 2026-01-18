package com.example.backend.broadcast.newsletter.repository;

import com.example.backend.broadcast.newsletter.entity.Newsletter;
import com.example.backend.broadcast.newsletter.entity.NewsletterStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NewsletterRepository extends JpaRepository<Newsletter, Long> {

    // 특정 상태이면서 삭제되지 않은 뉴스레터 조회
    Page<Newsletter> findAllByStatusAndIsDeletedFalse(NewsletterStatus status, Pageable pageable);

    // 제목으로 검색
    List<Newsletter> findAllByTitleContainingAndIsDeletedFalse(String title);

    // 삭제되지 않은 뉴스레터 전체 조회
    Page<Newsletter> findAllByIsDeletedFalse(Pageable pageable);

}
