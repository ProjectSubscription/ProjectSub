package com.example.backend.member.controller;

import com.example.backend.member.dto.request.BirthYearRequest;
import com.example.backend.member.dto.request.MemberRequest;
import com.example.backend.member.dto.request.NicknameChangeRequest;
import com.example.backend.member.dto.request.PasswordChangeRequest;
import com.example.backend.member.dto.response.MyInfoResponse;
import com.example.backend.member.dto.response.PublicMemberInfoResponse;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * TODO: Spring Security 설정 필요
 * - UserDetailsService 구현
 * - SecurityConfig 작성
 * - @PreAuthorize 활성화
 */
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
        Member member = memberService.registerMember(request);
        MyInfoResponse response = MyInfoResponse.fromEntity(member);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 내 정보 조회
     */
    @GetMapping("/me")
    public ResponseEntity<MyInfoResponse> getMyInfo(
            @AuthenticationPrincipal UserDetails userDetails) {

        // UserDetails에서 email(username) 추출
        String email = userDetails.getUsername();

        // email로 Member 조회 (Service에 메서드 추가 필요)
        Member member = memberService.findMemberByEmail(email);
        MyInfoResponse response = MyInfoResponse.fromEntity(member);

        return ResponseEntity.ok(response);
    }

    /**
     * 다른 회원 조회 (공개 프로필)
     */
    @GetMapping("/{id}")
    public ResponseEntity<PublicMemberInfoResponse> getMember(@PathVariable Long id) {
        Member member = memberService.findMemberById(id);
        PublicMemberInfoResponse response = PublicMemberInfoResponse.fromEntity(member);
        return ResponseEntity.ok(response);
    }

    /**
     * 전체 회원 조회 (관리자용)
     * TODO: @PreAuthorize("hasRole('ADMIN')") 추가 예정, 요구사항에 따라 페이징 고려할 것.
     */
    @GetMapping
    public ResponseEntity<List<MyInfoResponse>> getAllMembers() {
        List<Member> members = memberService.findAllMembers();
        List<MyInfoResponse> response = members.stream()
                .map(MyInfoResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * 비밀번호 변경 (본인만)
     */
    @PatchMapping("/password")
    public ResponseEntity<MyInfoResponse> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PasswordChangeRequest request) {

        String email = userDetails.getUsername();
        Member member = memberService.findMemberByEmail(email);

        //비밀번호 변경
        Member updatedMember = memberService.changePassword(member.getId(), request.getNewPassword());
        MyInfoResponse response = MyInfoResponse.fromEntity(updatedMember);

        return ResponseEntity.ok(response);
    }

    /**
     * 닉네임 변경 (본인만)
     */
    @PatchMapping("/nickname")
    public ResponseEntity<MyInfoResponse> changeNickname(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody NicknameChangeRequest request) {

        String email = userDetails.getUsername();
        Member member = memberService.findMemberByEmail(email);

        Member updatedMember = memberService.changeNickname(member.getId(), request.getNewNickname());
        MyInfoResponse response = MyInfoResponse.fromEntity(updatedMember);

        return ResponseEntity.ok(response);
    }

    /**
     * 생년 최초 입력 (본인만)
     */
    @PatchMapping("/birthyear")
    public ResponseEntity<MyInfoResponse> changeBirthYear(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BirthYearRequest request) {

        String email = userDetails.getUsername();
        Member member = memberService.findMemberByEmail(email);

        Member updatedMember = memberService.changeBirthYear(member.getId(), request.getBirthYear());
        MyInfoResponse response = MyInfoResponse.fromEntity(updatedMember);

        return ResponseEntity.ok(response);
    }

    /**
     * 회원 탈퇴 (본인만)
     */
    @DeleteMapping("/me")
    public ResponseEntity<Void> withdrawMember(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        Member member = memberService.findMemberByEmail(email);

        memberService.withdrawMember(member.getId());

        return ResponseEntity.noContent().build();
    }
}