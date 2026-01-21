package com.example.backend.broadcast.newsletter.entity;

import com.example.backend.broadcast.newsletter.dto.request.NewsletterRequestDTO;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "newsletters")
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class Newsletter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Enumerated(value = EnumType.STRING)
    @Column(nullable = false)
    private NewsletterStatus status;

    private LocalDateTime publishedAt;

    private boolean isDeleted;

    public void publish() {
        this.status = NewsletterStatus.PUBLISHED;
        this.publishedAt = LocalDateTime.now();
    }

    public void archive() {
        this.status = NewsletterStatus.ARCHIVED;
    }

    public boolean isPublished() {
        return status == NewsletterStatus.PUBLISHED;
    }

    public void update(NewsletterRequestDTO dto) {
        this.title = dto.getTitle();
        this.content = dto.getContent();
    }

    public void softDelete() {
        this.isDeleted = true;
    }

    public static Newsletter create(NewsletterRequestDTO dto) {
        return Newsletter.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .status(NewsletterStatus.DRAFT)
                .build();
    }

}
