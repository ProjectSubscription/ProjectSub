package com.example.backend.member.entity;

import com.example.backend.global.entity.AuditableEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "members")
@SQLDelete(sql = "UPDATE members SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false") // 삭제된 유저는 일반 조회 제외
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

    //entity 반환하는 실수했을 경우 방지
    @JsonIgnore 
    @Column()
    private String password;

    @Column(nullable = false, unique = true)
    private String nickname;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "member_roles", joinColumns = @JoinColumn(name = "member_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Set<Role> roles = new HashSet<>();

    @Column()
    private String oauthProvider;

    @Column()
    private Integer birthYear;

    @Column(nullable = false)
    private boolean isDeleted = false;

    public void addRole(Role role) {
        this.roles.add(role);
    }

    public void removeRole(Role role) {
        this.roles.remove(role);
    }

    public boolean hasRole(Role role) {
        return this.roles.contains(role);
    }

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

    public void changePassword(String encodedNewPassword) {
        this.password = encodedNewPassword;
    }

    public void changeNickname(String newNickname) {
        this.nickname = newNickname;
    }

    public boolean isOAuthMember() {
        return this.oauthProvider != null;
    }

    public void changeBirthYear(Integer newBirthYear) {
        this.birthYear = newBirthYear;
    }
}
