package com.example.backend.creatorapplication.entity;

import com.example.backend.creatorapplication.dto.request.CreatorApplicationRequestDTO;
import com.example.backend.global.entity.CreatedAtEntity;
import com.example.backend.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name = "creator_applications")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class CreatorApplication extends CreatedAtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApprovalStatus status = ApprovalStatus.REQUESTED;

    @Column(nullable = false)
    private String channelName;

    @Column(nullable = false)
    private String channelDescription;

    private String rejectReason;

    public static CreatorApplication create(CreatorApplicationRequestDTO dto , Member member) {
        return CreatorApplication.builder()
                .member(member)
                .channelName(dto.getChannelName())
                .channelDescription(dto.getChannelDescription())
                .build();
    }

    // 승인
    public void approve() {
        status = ApprovalStatus.APPROVED;
    }

    // 반려
    public void reject(String rejectReason) {
        status = ApprovalStatus.REJECTED;
        this.rejectReason = rejectReason;
    }
}
