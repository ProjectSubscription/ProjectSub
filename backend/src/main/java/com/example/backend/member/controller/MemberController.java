package com.example.backend.member.controller;

import com.example.backend.member.dto.request.*;
import com.example.backend.member.dto.response.MyInfoResponse;
import com.example.backend.member.entity.Member;
import com.example.backend.global.security.CustomUserDetails;
import com.example.backend.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/members")
@Slf4j
public class MemberController {

    private final MemberService memberService;

    /**
     * 회원가입 (인증 불필요)
     */
    @PostMapping("/register")
    public ResponseEntity<MyInfoResponse> registerMember(@Valid @RequestBody MemberRequest request) {
        log.info("회원 가입 요청 컨트롤러");
        Member member = memberService.registerMember(request);
        MyInfoResponse response = MyInfoResponse.fromEntity(member);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 내 정보 조회
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()") // 인증된 사용자만 접근 가능
    public ResponseEntity<MyInfoResponse> getMyInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("내 정보 조회 컨트롤러2, email = {}, id ={} ", userDetails.getEmail(), userDetails.getMemberId());
        Member member = memberService.findRegisteredMemberById(userDetails.getMemberId());
        MyInfoResponse response = MyInfoResponse.fromEntity(member);

        return ResponseEntity.ok(response);
    }

    /**
     * 회원 탈퇴 (본인만)
     */
    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> withdrawMember(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        memberService.withdrawMember(userDetails.getMemberId());

        return ResponseEntity.noContent().build();
    }

    /**
     * 비밀번호 변경 (본인만)
     */
    @PatchMapping("/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MyInfoResponse> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PasswordChangeRequest request) {

        //비밀번호 변경
        Member updatedMember = memberService.changePassword(userDetails.getMemberId(), request.getCurrentPassword(), request.getNewPassword());
        MyInfoResponse response = MyInfoResponse.fromEntity(updatedMember);

        return ResponseEntity.ok(response);
    }

    /**
     * 닉네임 변경 (본인만)
     */
    @PatchMapping("/nickname")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MyInfoResponse> changeNickname(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody NicknameChangeRequest request) {


        Member updatedMember = memberService.changeNickname(userDetails.getMemberId(), request.getNewNickname());
        MyInfoResponse response = MyInfoResponse.fromEntity(updatedMember);

        return ResponseEntity.ok(response);
    }

    /**
     * 비밀번호 분실 시 재설정 요청 (이메일 발송)
     */
    @PostMapping("/reset-password/request")
    public ResponseEntity<String> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        log.info("비밀번호 재설정 요청 컨트롤러: email={}", request.getEmail());
        memberService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok("비밀번호 재설정 이메일이 발송되었습니다.");
    }

    /**
     * 분실 비밀번호 재설정 (토큰 검증 후 변경)
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetConfirmRequest request) {
        log.info("비밀번호 재설정: token={}", request.getToken());
        memberService.passwordReset(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }

}