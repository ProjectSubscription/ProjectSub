package com.example.backend.contentreview.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ContentReviewRequestDto {
    private Long contentId;
    private Long memberId;
    private int rating;
    private String comment;

    public ContentReviewRequestDto(Long contentId, Long memberId, int rating, String comment) {
        this.contentId = contentId;
        this.memberId = memberId;
        this.rating = rating;
        this.comment = comment;
    }
}