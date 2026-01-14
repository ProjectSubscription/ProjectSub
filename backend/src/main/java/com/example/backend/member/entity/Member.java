package com.example.backend.member.entity;

import com.example.backend.global.entity.AuditableEntity;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.security.crypto.password.PasswordEncoder;

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

    @Column(unique = true)
    private String email;

    //entity 반환하는 실수했을 경우 방지
    @JsonIgnore
    @Column()
    private String password;

    @Column(unique = true)
    private String nickname;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "member_roles", joinColumns = @JoinColumn(name = "member_id")
    )
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "role", nullable = false)
    private Set<Role> roles = new HashSet<>();

    @Column()
    private String oauthProvider;

    @Column()
    private String oauthProviderId;

    @Column()
    private Integer birthYear;

    @Enumerated(EnumType.STRING)
    @Column()
    private Gender gender;

    @Builder.Default
    @Column(nullable = false) //가입 확정 상태 플래그
    private boolean profileCompleted = false;

    @Builder.Default
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

    public static Member create(String email, String password, String nickname, Set<Role> roles, Integer birthYear, Gender gender) {
        return Member.builder()
                .email(email)
                .password(password)
                .nickname(nickname)
                .roles(roles)
                .birthYear(birthYear)
                .gender(gender)
                .build();
    }

    //oauth 유저 회원가입
    public static Member createFromOAuth(String oauthProvider, String oauthProviderId, String email, Set<Role> roles) {

        if (oauthProvider == null || oauthProviderId == null) {
            throw new BusinessException(ErrorCode.OAUTH_INFO_REQUIRED);
        }

        return Member.builder()
                .oauthProvider(oauthProvider)
                .oauthProviderId(oauthProviderId)
                .email(email)
                .roles(roles)
                .build();
    }

    //비밀번호 재설정
    public void resetPassword(String newPassword, PasswordEncoder passwordEncoder) {

        // OAuth 유저는 비밀번호 재설정 불가
        if (this.isOAuthMember()) {
            throw new BusinessException(ErrorCode.OAUTH_MEMBER_PASSWORD_CHANGE);
        }

        this.password = passwordEncoder.encode(newPassword);
    }

    //비밀번호 변경
    public void changePassword(String currentPassword, String newPassword, PasswordEncoder encoder) {
        // OAuth 유저 체크
        if (this.isOAuthMember()) {
            throw new BusinessException(ErrorCode.OAUTH_MEMBER_PASSWORD_CHANGE);
        }

        // 현재 비밀번호 확인
        if (!encoder.matches(currentPassword, this.password)) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        // 동일 비밀번호 체크
        if (encoder.matches(newPassword, this.password)) {
            throw new BusinessException(ErrorCode.SAME_AS_OLD_PASSWORD);
        }

        this.password = encoder.encode(newPassword);
    }

    //닉네임 변경
    public void changeNickname(String newNickname) {

        // 기존 닉네임과 동일한지 체크
        if (this.nickname != null && this.nickname.equals(newNickname)) {
            throw new BusinessException(ErrorCode.SAME_AS_OLD_NICKNAME);
        }
        this.nickname = newNickname;
    }

    //oauth 유저 확인
    public boolean isOAuthMember() {
        return (this.oauthProvider != null && this.oauthProviderId != null);
    }

    //생년 변경
    public void changeBirthYear(Integer newBirthYear) {
        // 이미 입력했으면 변경 불가
        if (this.birthYear != null) {
            throw new BusinessException(ErrorCode.BIRTHYEAR_ALREADY_SET);
        }

        this.birthYear = newBirthYear;
    }

    //oauth 가입 유저 추가 정보 입력 및 상태 플래그 변경
    public void completeProfile(String email, String nickname, Integer birthYear, Gender gender) {

        // 1. OAuth 회원인지 체크
        if (!this.isOAuthMember()) {
            throw new BusinessException(ErrorCode.NOT_OAUTH_MEMBER);
        }

        // 2. 이미 프로필 완료했는지 체크
        if (this.isProfileCompleted()) {
            throw new BusinessException(ErrorCode.PROFILE_ALREADY_COMPLETED);
        }

        // 3. email 검증 (DB에 없으면 반드시 입력해야 함)
        if (this.getEmail() == null && email == null) {
            throw new BusinessException(ErrorCode.EMAIL_REQUIRED);
        }

        if (this.email == null && email != null) {
            this.email = email;
        }

        this.nickname = nickname;
        this.birthYear = birthYear;
        this.gender = gender;
        this.roles.add(Role.ROLE_USER);

        this.profileCompleted = true;
    }

    //일반 가입 유저 상태 플래그 변경(가입완료)
    public void finishSignup() {
        this.profileCompleted = true;
    }


}
