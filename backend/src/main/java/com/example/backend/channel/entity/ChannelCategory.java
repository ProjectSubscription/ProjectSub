package com.example.backend.channel.entity;

import lombok.Getter;

@Getter
public enum ChannelCategory {

    ECONOMY_BUSINESS("경제/비즈니스"),
    FINANCE("재테크"),
    REAL_ESTATE("부동산"),
    BOOK_PUBLISHING("책/작가/출판사"),
    HOBBY_PRACTICAL("취미/실용"),
    EDUCATION("교육/학습"),
    SELF_DEVELOPMENT("자기개발/취업"),
    CULTURE_ART("문화/예술"),
    TREND_LIFE("트렌드/라이프");

    private final String displayName;

    ChannelCategory(String displayName) {
        this.displayName = displayName;
    }
}