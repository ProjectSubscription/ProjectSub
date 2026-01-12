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

    /* ===== Subscription ===== */
    DUPLICATE_SUBSCRIPTION_PLAN(HttpStatus.CONFLICT, "이미 존재하는 구독 상품입니다."),
    INVALID_SUBSCRIPTION_STATE(HttpStatus.BAD_REQUEST, "구독 상태가 올바르지 않습니다."),
    SUBSCRIPTION_NOT_FOUND(HttpStatus.NOT_FOUND, "구독 정보를 찾을 수 없습니다."),

    /* ===== CreatorApplication ===== */
    APPLICATION_NOT_FOUND(HttpStatus.NOT_FOUND,"해당 크리에이터 신청 내역을 찾을 수 없습니다."),
    APPLICATION_ALREADY_REQUEST(HttpStatus.BAD_REQUEST,"이미 승인 대기 중인 신청 건이 존재합니다."),
    APPLICATION_FORBIDDEN(HttpStatus.FORBIDDEN,"해당 신청 내역에 대한 접근 권한이 없습니다."),
    APPLICATION_ALREADY_PROCESSED(HttpStatus.BAD_REQUEST,"이미 승인 또는 반려 처리가 완료된 신청입니다."),


    /* ===== Creator ===== */
    CREATOR_NOT_FOUND(HttpStatus.NOT_FOUND,"해당 크리에이터를 찾을 수 없습니다."),
    CREATOR_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "이미 크리에이터로 등록된 사용자입니다.");

    private final HttpStatus status;
    private final String message;
}
