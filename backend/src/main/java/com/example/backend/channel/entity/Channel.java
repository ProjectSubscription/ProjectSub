package com.example.backend.channel.entity;

import com.example.backend.global.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "channels")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
@Getter
public class Channel extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long creatorId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChannelCategory category;

    @Column(nullable = false)
    private int subscriberCount;

    @Column(nullable = false)
    private boolean isActive;

    public static Channel create(
            Long creatorId,
            String title,
            String description,
            ChannelCategory category
    ) {
        return Channel.builder()
                .creatorId(creatorId)
                .title(title)
                .description(description)
                .category(category)
                .subscriberCount(0)
                .isActive(true)
                .build();
    }

    public void update(String title, String description, ChannelCategory category) {
        this.title = title;
        this.description = description;
        this.category = category;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void increaseSubscriber() {
        this.subscriberCount++;
    }

    public void decreaseSubscriber() {
        if (this.subscriberCount > 0) {
            this.subscriberCount--;
        }
    }
}