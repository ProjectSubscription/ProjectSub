package com.example.backend.creator.entity;

import com.example.backend.global.entity.CreatedAtEntity;
import com.example.backend.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name = "creators")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
public class Creator extends CreatedAtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CreatorStatus status = CreatorStatus.ACTIVE;

    private String introduction;

    @Builder.Default
    private Integer settlementRate = 90;

    public static Creator create(Member member) {
        return Creator.builder()
                .member(member)
                .build();
    }

    public void changeStatus(CreatorStatus status) {
        this.status = status;
    }
}
