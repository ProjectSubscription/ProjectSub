package com.example.backend.member.service;

import com.example.backend.member.repository.MemberRepository;
import com.example.backend.member.dto.request.MemberRequest;
import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MemberService {

    //todo: 일반 -> 소셜로그인이 되게 할 것인가.(내생각엔 필요함, 해당 이메일 쓰다가 소셜쪽으로 넘기게하는 방법이 없음 탈퇴하고 소셜로그인해야함)
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    //유저 회원가입
    public Member registerMember(MemberRequest dto) {
        return signupWithRoles(dto, Set.of(Role.ROLE_USER));
    }

    //생산자 회원가입 -- case1
    //TODO: 유저 -> 크리에이터 승격 요청 -> 관리자 승인 구조라면 이 메소드 필요없음, 승격 메소드만 존재해야함.
    public Member registerCreator(MemberRequest dto) {
        return signupWithRoles(dto, Set.of(Role.ROLE_USER, Role.ROLE_CREATOR));
    }

    //관리자 계정 생성
    public Member registerAdmin(MemberRequest dto) {
        return signupWithRoles(dto, Set.of(Role.ROLE_USER, Role.ROLE_ADMIN));
    }

    @Transactional(readOnly = true)
    public Member findMemberById(Long id) {
        Member member = memberRepository.findById(id).orElseThrow(() -> new RuntimeException("Member with id " + id + " not found!"));
        return member;
    }

    @Transactional(readOnly = true)
    public List<Member> findAllMembers() {
        List<Member> members = memberRepository.findAll();
        return members;
    }

    @Transactional(readOnly = true)
    public Member findMemberByEmail(String email) {
        Member member = memberRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Member with email " + email + " not found!"));
        return member;
    }

    public Member changePassword(Long memberId, String newPassword) {
        log.info("비밀번호 변경 시도 memberId = {}", memberId);
        Member member = findMemberById(memberId);
        if (member.isOAuthMember()){
            throw new RuntimeException("OAuth 유저는 비밀번호가 존재하지 않습니다.");
        }
        /**
         *     // 1. 기존 비밀번호 확인
         *     if (!passwordEncoder.matches(currentPassword, member.getPassword())) {
         *         throw new InvalidPasswordException("기존 비밀번호가 일치하지 않습니다");
         *     }
         *
         *     // 2. 동일 비밀번호 체크
         *     if (currentPassword.equals(newPassword)) {
         *         throw new SamePasswordException("기존 비밀번호와 동일합니다");
         *     }
         */
        String encodedNewPassword = encodingPassword(newPassword);
        member.changePassword(encodedNewPassword);
        log.info("비밀번호 변경 성공 memberId = {}", memberId);
        return member;
    }

    public Member changeNickname(Long memberId, String newNickname) {
        log.info("닉네임 변경 시도 memberId = {},newNickname ={}", memberId,  newNickname);
        Member member = findMemberById(memberId);
        //1. 기존 닉네임 체크
        if (member.getNickname().equals(newNickname)){
            log.warn("닉네임 중복: {}",newNickname);
            throw new RuntimeException("기존 닉네임과 일치합니다.");
        }

        //2. 닉네임 사용 체크
        if (memberRepository.existsByNickname(newNickname)){
            log.warn("해당 닉네임 존재: {} ", newNickname);
            throw new RuntimeException("이미 사용 중인 닉네임입니다");
        }
        member.changeNickname(newNickname);
        log.info("닉네임 변경 성공: {}", member.getNickname());
        return member;
    }
    
    //생년월일 최초 1회 입력 가능, 생년월일 입력 안한 유저만 사용
    public Member changeBirthYear(Long memberId, Integer newBirthYear) {
        log.info("생년 변경 시도 memberId = {}", memberId);
        Member member = findMemberById(memberId);

        // 1. 이미 입력했으면 변경 불가
        if (member.getBirthYear() != null) {
            throw new RuntimeException("생년은 수정할 수 없습니다."); //todo: 관리자 문의 요청으로 해결 할 수 있도록 처리 개선 여지있음
        }

        // 2. 생년 월일 입력
        member.changeBirthYear(newBirthYear);
        log.info("생년 입력 완료 memberId = {}", memberId);
        return member;
    }

    public void withdrawMember(Long memberId) {
        log.info("회원 탈퇴 시도 memberId = {}", memberId);
        Member member = findMemberById(memberId);

        // 이미 탈퇴한 회원인지 체크
        if (member.isDeleted()) {
            throw new RuntimeException("이미 탈퇴한 회원입니다");
        }

        memberRepository.delete(member);  // 소프트 삭제 실행

        log.info("회원 탈퇴 완료 memberId = {}, deleted = {}", memberId, member.isDeleted());
    }

    //회원 가입 로직
    private Member signupWithRoles(MemberRequest dto, Set<Role> roles) {
        log.info("회원가입 시도: roles={} email={}", roles, dto.getEmail());

        //1. 중복 체크
        validateAuthentication(dto.getPassword(), dto.getOauthProvider());
        validateDuplication(dto.getEmail(), dto.getNickname());

        //2.일반 가입 유저 암호 인코딩, OAuth 는 스킵
        String encodedPassword = encodingPassword(dto.getPassword());

        //3. 엔티티 생성
        Member member = Member.create(
                dto.getEmail(),
                encodedPassword,
                dto.getNickname(),
                roles, dto.getOauthProvider(),
                dto.getBirthYear());

        Member savedMember = memberRepository.save(member);
        log.info("회원가입 완료: email={}, nickname={}, provider={}",
                savedMember.getEmail(),
                savedMember.getNickname(),
                savedMember.isOAuthMember()  ? savedMember.getOauthProvider() : "Oauth 이용 안함.");
        return savedMember;
    }

    //비밀번호 인코딩
    private String encodingPassword(String password) {
        String encodedPassword = null;
        if (password != null) {
            //todo: passwordEncoder 추가후 변경
            encodedPassword = password;
        }
        return encodedPassword;
    }

    //중복 검증
    private void validateDuplication(String email, String nickname) {
        if (memberRepository.existsByEmail(email)) {
            log.warn("중복된 이메일로 가입 시도: {}", email);
            throw new RuntimeException("이메일 중복");
        }

        if (memberRepository.existsByNickname(nickname)) {
            log.warn("중복된 닉네임으로 가입 시도: {}", nickname);
            throw new RuntimeException("닉네임 중복");
        }
    }

    //인증 방식 검증
    private void validateAuthentication(String password, String oauthProvider) {
        boolean hasProvider = (oauthProvider != null);
        boolean hasPassword = (password != null);

        if (hasProvider && hasPassword) {
            throw new RuntimeException("비밀번호와 OAuth는 동시에 사용할 수 없습니다");
        }

        if (!hasProvider && !hasPassword) {
            throw new RuntimeException("비밀번호 또는 OAuth 제공자가 필요합니다");
        }
    }


}
