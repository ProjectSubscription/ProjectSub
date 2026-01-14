package com.example.backend.member.controller;

import com.example.backend.member.dto.request.*;
import com.example.backend.member.dto.response.MyInfoResponse;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ⚠️ 테스트 전용 컨트롤러 - 인증 없이 테스트
 * 실제 운영에서는 제거하거나 프로필로 비활성화할 것!
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/test/members")
@Slf4j
public class TestMemberController {

    private final MemberService memberService;

    /**
     * 일반 회원가입
     */
    @PostMapping("/register")
    public ResponseEntity<MyInfoResponse> registerMember(@Valid @RequestBody MemberRequest request) {
        log.info("테스트 - 일반 회원가입 요청");
        Member member = memberService.registerMember(request);
        MyInfoResponse response = MyInfoResponse.fromEntity(member);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * OAuth 임시 가입
     */
    @PostMapping("/oauth/register")
    public ResponseEntity<MyInfoResponse> registerOAuthMember(
            @RequestParam String provider,
            @RequestParam String providerUserId,
            @RequestParam(required = false) String email) {
        log.info("테스트 - OAuth 임시 가입 요청: provider={}, providerUserId={}", provider, providerUserId);
        Member member = memberService.registerOAuthMember(provider, providerUserId, email);
        MyInfoResponse response = MyInfoResponse.fromEntity(member);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * OAuth 프로필 완성 (추가정보 입력)
     */
    @PostMapping("/{memberId}/complete-profile")
    public ResponseEntity<MyInfoResponse> completeOAuthProfile(
            @PathVariable Long memberId,
            @Valid @RequestBody CompleteOAuthProfileRequest request) {
        log.info("테스트 - OAuth 프로필 완성 요청: memberId={}", memberId);
        Member member = memberService.completeOAuthMemberProfile(memberId, request);
        MyInfoResponse response = MyInfoResponse.fromEntity(member);
        return ResponseEntity.ok(response);
    }

    /**
     * 회원 조회 (ID)
     */
    @GetMapping("/{memberId}")
    public ResponseEntity<MyInfoResponse> getMember(@PathVariable Long memberId) {
        log.info("테스트 - 회원 조회: memberId={}", memberId);
        Member member = memberService.findRegisteredMemberById(memberId);
        MyInfoResponse response = MyInfoResponse.fromEntity(member);
        return ResponseEntity.ok(response);
    }

    /**
     * 전체 회원 조회
     */
    @GetMapping
    public ResponseEntity<List<MyInfoResponse>> getAllMembers() {
        log.info("테스트 - 전체 회원 조회");
        List<Member> members = memberService.findAllRegisteredMembers();
        List<MyInfoResponse> response = members.stream()
                .map(MyInfoResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * 비밀번호 변경
     */
    @PatchMapping("/{memberId}/password")
    public ResponseEntity<MyInfoResponse> changePassword(
            @PathVariable Long memberId,
            @Valid @RequestBody PasswordChangeRequest request) {
        log.info("테스트 - 비밀번호 변경: memberId={}", memberId);
        Member member = memberService.changePassword(memberId, request.getCurrentPassword(), request.getNewPassword());
        MyInfoResponse response = MyInfoResponse.fromEntity(member);
        return ResponseEntity.ok(response);
    }

    /**
     * 닉네임 변경
     */
    @PatchMapping("/{memberId}/nickname")
    public ResponseEntity<MyInfoResponse> changeNickname(
            @PathVariable Long memberId,
            @Valid @RequestBody NicknameChangeRequest request) {
        log.info("테스트 - 닉네임 변경: memberId={}", memberId);
        Member member = memberService.changeNickname(memberId, request.getNewNickname());
        MyInfoResponse response = MyInfoResponse.fromEntity(member);
        return ResponseEntity.ok(response);
    }

    /**
     * 생년 입력
     */
    @PatchMapping("/{memberId}/birthyear")
    public ResponseEntity<MyInfoResponse> changeBirthYear(
            @PathVariable Long memberId,
            @Valid @RequestBody BirthYearRequest request) {
        log.info("테스트 - 생년 입력: memberId={}", memberId);
        Member member = memberService.changeBirthYear(memberId, request.getBirthYear());
        MyInfoResponse response = MyInfoResponse.fromEntity(member);
        return ResponseEntity.ok(response);
    }

    /**
     * 회원 탈퇴
     */
    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> withdrawMember(@PathVariable Long memberId) {
        log.info("테스트 - 회원 탈퇴: memberId={}", memberId);
        memberService.withdrawMember(memberId);
        return ResponseEntity.noContent().build();
    }


    /**
     * 비밀번호 재설정 요청 (이메일 발송)
     */
    @PostMapping("/reset-password/request")
    public ResponseEntity<String> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        log.info("테스트 - 비밀번호 재설정 요청: email={}", request.getEmail());
        memberService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok("비밀번호 재설정 이메일이 발송되었습니다.");
    }

    /**
     * 비밀번호 재설정 (토큰 검증 후 변경)
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetConfirmRequest request) {
        log.info("테스트 - 비밀번호 재설정: token={}", request.getToken());
        memberService.passwordReset(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }

    /**
     * 탈퇴한 회원 포함 조회 (ID)
     */
    @GetMapping("/including-deleted/{id}")
    public ResponseEntity<Member> findMemberIncludingDeleted(@PathVariable Long id) {
        Member memberIncludingDeleted = memberService.findMemberIncludingDeleted(id);
        return ResponseEntity.ok(memberIncludingDeleted);
    }

    /**
     * 탈퇴한 회원 포함 전체 조회
     */
    @GetMapping("/including-deleted")
    public ResponseEntity<List<Member>> findAllIncludingDeletedMembers() {
        List<Member> allRegisteredMembers = memberService.findAllIncludingDeletedMembers();
        return  ResponseEntity.ok(allRegisteredMembers);
    }
}