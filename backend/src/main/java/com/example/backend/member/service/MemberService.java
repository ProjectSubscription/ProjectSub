package com.example.backend.member.service;

import com.example.backend.creator.entity.CreatorStatus;
import com.example.backend.creator.service.CreatorService;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Gender;
import com.example.backend.member.repository.MemberRepository;
import com.example.backend.member.dto.request.MemberRequest;
import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.Role;
import com.example.backend.notification.service.NotificationSettingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.springframework.util.StringUtils.hasText;

@Service
@Transactional
@Slf4j
public class MemberService {

    private final PasswordResetService passwordResetService;
    private final MemberRepository memberRepository;


    private final CreatorService creatorService;
    private final NotificationSettingService notificationSettingService;
    private final PasswordEncoder passwordEncoder;


    public MemberService(@Lazy CreatorService creatorService,
                         MemberRepository memberRepository,
                         PasswordEncoder passwordEncoder,
                         PasswordResetService passwordResetService,
                         NotificationSettingService  notificationSettingService) {
        this.creatorService = creatorService;
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetService = passwordResetService;
        this.notificationSettingService = notificationSettingService;
    }

    //유저 회원가입
    public Member registerMember(MemberRequest dto) {
        HashSet<Role> roles = new HashSet<>();
        roles.add(Role.ROLE_USER);
        return signupWithRoles(dto, roles);
    }

    //크리에이터 승인
    public Member approveCreator(Long id) {
        log.info("크리에이터 승인 신청 id = {}", id);
        Member member = findRegisteredMemberById(id);

        // 이미 크리에이터인지 확인
        if (member.hasRole(Role.ROLE_CREATOR)) {
            log.warn("이미 크리에이터입니다: id={}", id);
            throw new BusinessException(ErrorCode.ALREADY_CREATOR);
        }

        // 일반 유저인지 확인
        if (!member.hasRole(Role.ROLE_USER)) {
            throw new BusinessException(ErrorCode.NOT_REGULAR_MEMBER);
        }

        member.addRole(Role.ROLE_CREATOR);
        log.info("크리에이터 승인 완료: id={}", id);
        return member;
    }

    //관리자 계정 생성
    public Member registerAdmin(MemberRequest dto) {
        HashSet<Role> roles = new HashSet<>();
        roles.add(Role.ROLE_USER);
        roles.add(Role.ROLE_ADMIN);
        return signupWithRoles(dto, roles);
    }

    //oauth 유저 가입
    public Member registerOAuthMember(String provider, String providerUserId, String confirmedEmail,
                                      String nickname, Integer birthYear, Gender gender) {
        log.info("oauth 가입 요청. 추가 정보 입력해야함.");
        //oauth 유저 추가 정보 입력

        //1.필수 값 검증====================
        validateRequiredValue(confirmedEmail, nickname);

        //1-2.중복체크====================
        validateDuplication(confirmedEmail, nickname);

        Member member = Member.createFromOAuth(provider, providerUserId, confirmedEmail);
        log.info("oauth 회원 추가 정보 입력 시도 email={}", confirmedEmail);
        member.completeProfile(nickname, birthYear, gender);

        memberRepository.save(member);

        //알림설정
        notificationSettingService.createNotificationSetting(member.getId());
        log.info("oauth 회원 추가 정보 입력 성공 nickname={}", nickname);
        log.info("oauth 회원 임시 가입 완료");

        return member;
    }


    //회원 가입 로직
    private Member signupWithRoles(MemberRequest dto, Set<Role> roles) {
        log.info("회원가입 시도: roles={} email={}", roles, dto.getEmail());

        //1. 필수값 검증
        validateRequiredValue(dto.getEmail(), dto.getNickname());

        //1-2. 중복 체크
        validateDuplication(dto.getEmail(), dto.getNickname());
        
        //2.일반 가입 유저 암호 인코딩
        String encodedPassword = encodingPassword(dto.getPassword());

        //3. 엔티티 생성
        Member member = Member.create(
                dto.getEmail(),
                encodedPassword,
                dto.getNickname(),
                roles,
                dto.getBirthYear(),
                dto.getGender());

        Member savedMember = memberRepository.save(member);
        savedMember.finishSignup();
        
        //알림설정
        notificationSettingService.createNotificationSetting(member.getId());
        log.info("회원가입 완료: email={}, nickname={}, provider={}",
                savedMember.getEmail(),
                savedMember.getNickname(),
                savedMember.isOAuthMember() ? savedMember.getOauthProvider() : "Oauth 이용 안함.");
        return savedMember;
    }

    @Transactional(readOnly = true)
    public Member findRegisteredMemberById(Long id) {
        Member member = memberRepository.findById(id).orElseThrow(() -> {
            log.warn("해당 id값을 가진 회원을 찾지 못 했습니다. id = {}", id);
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        });
        return member;
    }

    @Transactional(readOnly = true)
    public Member findRegisteredMemberByEmail(String email) {
        Member member = memberRepository.findByEmail(email).orElseThrow(() -> {
            log.warn("해당 이메일을 가진 멤버를 찾지 못 했습니다. email = {}", email);
            throw new BusinessException(ErrorCode.MEMBER_NOT_FOUND);
        });
        return member;
    }

    @Transactional(readOnly = true)
    public Member findRegisteredMemberByOAuth(String provider, String providerUserId) {
        Member member = memberRepository.findByOauthProviderAndOauthProviderId(provider, providerUserId).
                orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        return member;
    }

    //탈퇴 유저 포함 조회
    @Transactional(readOnly = true)
    public Member findMemberIncludingDeleted(Long id) {
        //탈퇴한 회원 id, nickname(value = 탈퇴유저_id값) 제외 필드는 null 값.
        log.info("탈퇴 회원 포함 조회 시도 id= {}", id);
        Member member = memberRepository.findByIdIncludingDeleted(id).orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));
        log.info("탈퇴 회원 포함 조회 성공 id= {}", id);
        return member;
    }

    @Transactional(readOnly = true)
    public List<Member> findAllRegisteredMembers() {
        List<Member> members = memberRepository.findAll();
        return members;
    }

    //탈퇴 유저 포함 전체 조회
    @Transactional(readOnly = true)
    public List<Member> findAllIncludingDeletedMembers() {
        log.info("탈퇴 회원 포함 전체 조회");
        //탈퇴한 회원 id, nickname(value = 탈퇴유저_id값) 제외 필드는 null 값.
        List<Member> members = memberRepository.findAllIncludingDeleted();
        log.info("탈퇴 회원 포함 전체 조회 성공");
        return members;
    }

    //가입중인 유저id 값 전체 조회
    @Transactional(readOnly = true)
    public List<Long> findAllRegisteredMemberIds() {
        log.info("회원 id 값 전체 조회");
        List<Long> memberIds =  memberRepository.findAllIds();

        return memberIds;
    }

    public Member changePassword(Long memberId, String currentPassword, String newPassword) {
        log.info("비밀번호 변경 시도 memberId = {}", memberId);
        Member member = findRegisteredMemberById(memberId);

        member.changePassword(currentPassword, newPassword, passwordEncoder);
        log.info("비밀번호 변경 성공 memberId = {}", memberId);
        return member;
    }

    public Member changeNickname(Long memberId, String newNickname) {
        log.info("닉네임 변경 시도 memberId = {},newNickname ={}", memberId, newNickname);
        Member member = findRegisteredMemberById(memberId);

        //1. 닉네임 중복 체크
        if (memberRepository.existsByNickname(newNickname)) {
            log.warn("해당 닉네임 존재: {} ", newNickname);
            throw new BusinessException(ErrorCode.DUPLICATE_NICKNAME);
        }
        member.changeNickname(newNickname);
        log.info("닉네임 변경 성공: memberNickname = {}", member.getNickname());
        return member;
    }

    //지금 사용 X 나중에 관리자로 될수도있을듯.
    public Member changeBirthYear(Long memberId, Integer newBirthYear) {
        log.info("생년 변경 시도 memberId = {}", memberId);
        Member member = findRegisteredMemberById(memberId);

        member.changeBirthYear(newBirthYear);
        log.info("생년 입력 완료 memberId = {}", memberId);
        return member;
    }

    //회원 탈퇴
    public void withdrawMember(Long memberId) {
        log.info("회원 탈퇴 시도 memberId = {}", memberId);
        Member member = findRegisteredMemberById(memberId);

        if (member.hasRole(Role.ROLE_CREATOR)) {
            creatorService.changeStatus(memberId, CreatorStatus.DELETED);
        }

        member.withdraw();
        log.info("회원 탈퇴 완료 memberId = {},email = {}, deleted = {}", memberId, member.getEmail(), member.isDeleted());
    }

    //비밀번호 찾기 -> 이메일 요청
    public void requestPasswordReset(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElse(null);

        if (member != null) {
            log.info("이메일 로직");
            passwordResetService.sendPasswordResetEmail(member);
        }

        // 해당 이메일이 있어도 없어도 같은 응답메세지를 반환해야한다. (보안)
        log.info("비밀번호 재설정 요청 처리: {}", email);
    }

    //비밀번호 찾기 -> 재설정
    public void passwordReset(String token, String newPassword) {
        log.info("새 비밀번호로 변경 중");
        Long memberId = passwordResetService.validateAndConsumeToken(token);
        Member member = findRegisteredMemberById(memberId);
        member.resetPassword(newPassword, passwordEncoder);
        log.info("비밀번호 변경 완료.");
    }

    //입력 비밀번호 검증
    public boolean matchesPassword(String rawPassword, String encodedPassword) {
        log.info("입력 비밀번호 검증 시도");
        if (encodedPassword == null) return false; //oauth 유저
        boolean result = passwordEncoder.matches(rawPassword, encodedPassword);
        log.info("입력 비밀번호 검증 완료 result = {}", result);
        return result;
    }

    //비밀번호 인코딩
    private String encodingPassword(String password) {
        String encodedPassword = null;
        if (password != null) {
            encodedPassword = passwordEncoder.encode(password);
        }
        return encodedPassword;
    }

    //중복 검증
    private void validateDuplication(String email, String nickname) {
        if (memberRepository.existsByEmail(email)) {
            log.warn("중복된 이메일로 가입 시도: {}", email);
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        if (memberRepository.existsByNickname(nickname)) {
            log.warn("중복된 닉네임으로 가입 시도: {}", nickname);
            throw new BusinessException(ErrorCode.DUPLICATE_NICKNAME);
        }
    }

    //필수 값 검증
    private void validateRequiredValue(String confirmedEmail, String nickname) {
        if (!hasText(confirmedEmail)) {
            throw new BusinessException(ErrorCode.EMAIL_REQUIRED);
        }

        if (!hasText(nickname)) {
            throw new BusinessException(ErrorCode.NICKNAME_REQUIRED);
        }
    }
}
