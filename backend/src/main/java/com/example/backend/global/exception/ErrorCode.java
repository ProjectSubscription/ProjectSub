package com.example.backend.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    /* ===== Common ===== */
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "요청한 리소스를 찾을 수 없습니다."),

    /* ===== Channel ===== */
    CHANNEL_NOT_FOUND(HttpStatus.NOT_FOUND, "채널을 찾을 수 없습니다."),
    CHANNEL_INACTIVE(HttpStatus.BAD_REQUEST, "비활성화된 채널입니다."),
    CHANNEL_OWNER_MISMATCH(HttpStatus.FORBIDDEN, "채널 소유자가 아닙니다."),
    CHANNEL_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "이미 채널이 존재합니다."),

    /* ===== Subscription ===== */
    DUPLICATE_SUBSCRIPTION_PLAN(HttpStatus.CONFLICT, "이미 존재하는 구독 상품입니다."),
    DUPLICATE_ACTIVE_SUBSCRIPTION(HttpStatus.CONFLICT, "이미 활성화된 구독이 존재합니다."),
    INVALID_SUBSCRIPTION_STATE(HttpStatus.BAD_REQUEST, "구독 상태가 올바르지 않습니다."),
    SUBSCRIPTION_NOT_FOUND(HttpStatus.NOT_FOUND, "구독 정보를 찾을 수 없습니다."),

    /* ===== Subscription Plan ===== */
    SUBSCRIPTION_PLAN_NOT_FOUND(HttpStatus.NOT_FOUND,"구독 상품을 찾을 수 없습니다."),
    INACTIVE_SUBSCRIPTION_PLAN(HttpStatus.BAD_REQUEST, "비활성화된 구독 상품입니다."),
    INVALID_SUBSCRIPTION_STATUS(HttpStatus.BAD_REQUEST,"현재 상태에서는 해당 작업을 수행할 수 없습니다."),
    SUBSCRIPTION_PLAN_CHANNEL_MISMATCH(HttpStatus.BAD_REQUEST, "구독 상품이 해당 채널에 속하지 않습니다."),

    /* ===== CreatorApplication ===== */
    APPLICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 크리에이터 신청 내역을 찾을 수 없습니다."),
    APPLICATION_ALREADY_REQUEST(HttpStatus.BAD_REQUEST, "이미 승인 대기 중인 신청 건이 존재합니다."),
    APPLICATION_FORBIDDEN(HttpStatus.FORBIDDEN, "해당 신청 내역에 대한 접근 권한이 없습니다."),
    APPLICATION_ALREADY_PROCESSED(HttpStatus.BAD_REQUEST, "이미 승인 또는 반려 처리가 완료된 신청입니다."),

    /* ===== Creator ===== */
    CREATOR_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 크리에이터를 찾을 수 없습니다."),
    CREATOR_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "이미 크리에이터로 등록된 사용자입니다."),
    CREATOR_ALREADY_DELETED(HttpStatus.BAD_REQUEST, "이미 탈퇴한 크리에이터입니다."),
    CREATOR_STATUS_STOPPED(HttpStatus.BAD_REQUEST, "현재 정지된 크리에이터입니다."),

    /* ===== Member ===== */
    //조회
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."),
    MEMBER_ALREADY_DELETED(HttpStatus.BAD_REQUEST, "이미 탈퇴한 회원입니다."),
    //중복 검증
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다."),
    //비밀번호
    OAUTH_MEMBER_PASSWORD_CHANGE(HttpStatus.BAD_REQUEST, "OAuth 회원은 비밀번호를 변경할 수 없습니다."), //OAuth 유저는 비밀번호 없음
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "기존 비밀번호가 일치하지 않습니다."),
    SAME_AS_OLD_PASSWORD(HttpStatus.BAD_REQUEST, "기존 비밀번호와 동일합니다."),
    //정보 변경
    SAME_AS_OLD_NICKNAME(HttpStatus.BAD_REQUEST, "기존 닉네임과 일치합니다."),
    BIRTHYEAR_ALREADY_SET(HttpStatus.BAD_REQUEST, "생년은 수정할 수 없습니다."),
    //권한
    ALREADY_CREATOR(HttpStatus.CONFLICT, "이미 크리에이터입니다."),
    NOT_REGULAR_MEMBER(HttpStatus.BAD_REQUEST, "일반 회원만 크리에이터로 승인 가능합니다."),
    //OAuth 가입
    OAUTH_INFO_REQUIRED(HttpStatus.BAD_REQUEST, "OAuth 인증 정보가 필요합니다."),
    PROFILE_ALREADY_COMPLETED(HttpStatus.BAD_REQUEST, "이미 프로필 작성이 완료되었습니다."),
    NOT_OAUTH_MEMBER(HttpStatus.BAD_REQUEST, "OAuth 회원이 아닙니다."),
    EMAIL_REQUIRED(HttpStatus.BAD_REQUEST, "이메일 입력이 필요합니다."),
    //토큰
    INVALID_TOKEN(HttpStatus.BAD_REQUEST, "유효하지 않은 비밀번호 리셋 토큰입니다."),
    TOKEN_EXPIRED(HttpStatus.BAD_REQUEST, "만료된 비밀번호 리셋 토큰입니다."),

    /* ===== Content Review ===== */
    REVIEW_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 해당 콘텐츠에 대한 리뷰를 작성했습니다."),
    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "리뷰를 찾을 수 없습니다."),
    CONTENT_NOT_FOUND(HttpStatus.NOT_FOUND, "콘텐츠를 찾을 수 없습니다."),

    /* ===== Content Review Comment ===== */
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String message;
}
