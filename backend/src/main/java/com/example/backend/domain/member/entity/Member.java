package com.example.backend.domain.member.entity;

import com.example.backend.global.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.HashSet;
import java.util.Set;

@Entity
/*@SQLDelete(sql = "UPDATE member SET is_deleted = true WHERE id = ?") //조금더 알아봐야함
@SQLRestriction("is_deleted = false")  // 조금 더 알아봐야함*/
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder(access = AccessLevel.PRIVATE)
@Getter
public class Member extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column()
    private String password;

    @Column(nullable = false, unique = true)
    private String nickname;

    @Column(nullable = false)
    private Set<Role> roles = new HashSet<>();

    @Column()
    private String oauthProvider;

    @Column(nullable = false)
    private boolean isDeleted = false;

    @Column()
    private Integer birthYear;

    public static Member create(String email, String password, String nickname, Set<Role> roles, String oauthProvider, Integer birthYear) {
        return Member.builder()
                .email(email)
                .password(password)
                .nickname(nickname)
                .roles(roles)
                .oauthProvider(oauthProvider)
                .birthYear(birthYear)
                .build();
    }
}
