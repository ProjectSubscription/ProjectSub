package com.example.backend.creatorapplication.service;

import com.example.backend.creator.service.CreatorService;
import com.example.backend.creatorapplication.dto.request.ApprovalRequestDTO;
import com.example.backend.creatorapplication.dto.request.CreatorApplicationRequestDTO;
import com.example.backend.creatorapplication.dto.response.AllCreatorApplicationResponseDTO;
import com.example.backend.creatorapplication.dto.response.CreatorAppSuccessResponseDTO;
import com.example.backend.creatorapplication.dto.response.CreatorApplicationDetailResponseDTO;
import com.example.backend.creatorapplication.dto.response.MyCreatorApplicationResponseDTO;
import com.example.backend.creatorapplication.entity.ApprovalStatus;
import com.example.backend.creatorapplication.entity.CreatorApplication;
import com.example.backend.creatorapplication.repository.CreatorApplicationRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.member.entity.Role;
import com.example.backend.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CreatorApplicationService {

    private final CreatorApplicationRepository creatorApplicationRepository;
    private final CreatorService creatorService;
    private final MemberService memberService;


    // 크리에이터 신청 생성
    public CreatorAppSuccessResponseDTO createApplication(Long memberId, CreatorApplicationRequestDTO dto) {

        log.info("크리에이터 신청 생성 - channelName={}, channelDescription={}", dto.getChannelName(), dto.getChannelDescription());

        Member member = memberService.findMemberById(memberId);

        // 이미 크리에이터인지 확인
        if (creatorService.isCreator(memberId)) {
            log.error("이미 가입된 크리에이터 입니다. memberId={}", memberId);
            throw new BusinessException(ErrorCode.CREATOR_ALREADY_EXISTS);
        }

        // 승인 대기중에 또 신청했을 때
        if (creatorApplicationRepository.existsByMemberIdAndStatus(memberId, ApprovalStatus.REQUESTED)) {
            log.error("이미 신청 승인 대기 중입니다. memberId={}", memberId);
            throw new BusinessException(ErrorCode.APPLICATION_ALREADY_REQUEST);
        }

        CreatorApplication creatorApplication = CreatorApplication.create(dto, member);

        CreatorApplication saved = creatorApplicationRepository.save(creatorApplication);

        log.info("크리에이터 신청 생성 성공 - appId={}, memberId={}", saved.getId(), memberId);

        return CreatorAppSuccessResponseDTO.create(saved.getId());
    }

    // 내 신청 이력 조회
    @Transactional(readOnly = true)
    public Page<MyCreatorApplicationResponseDTO> getMyApplications(Long memberId, Pageable pageable) {
        log.info("크리에이터 신청 이력 조회 - memberId={}", memberId);
        return creatorApplicationRepository.findByMemberId(memberId, pageable)
                .map(MyCreatorApplicationResponseDTO::create);
    }

    // 모든 신청 이력 조회 (admin)
    @Transactional(readOnly = true)
    public Page<AllCreatorApplicationResponseDTO> getApplications(Pageable pageable) {
        return creatorApplicationRepository.findAll(pageable)
                .map(AllCreatorApplicationResponseDTO::create);
    }

    // 신청 상세 조회
    @Transactional(readOnly = true)
    public CreatorApplicationDetailResponseDTO getAppDetail(Member member, Long applicationId) {

        log.info("크리에이터 신청 상세 조회 start - applicationId={}", applicationId);

        // 관리자가 아니면서 로그인사용자와 신청자가 다른경우
        if (!member.getId().equals(member.getId()) &&
                !member.getRoles().contains(Role.ROLE_ADMIN)) {
            log.error("신청 상세조회 접근 권한 없음. memberId={}", member.getId());
            throw new BusinessException(ErrorCode.APPLICATION_FORBIDDEN);
        }

        CreatorApplication application = getCreatorApplication(applicationId);

        return CreatorApplicationDetailResponseDTO.create(application);
    }

    // 신청 승인 / 반려 (admin)
    public MyCreatorApplicationResponseDTO approvalApplication(Long applicationId, ApprovalRequestDTO dto) {

        log.info("크리에이터 신청 승인/반려 start - applicationId={}", applicationId);

        CreatorApplication application = getCreatorApplication(applicationId);

        // 이미 승인 / 반려 된 신청을 다시 승인 / 반려하려는 시도 방지
        if (application.getStatus() != ApprovalStatus.REQUESTED) {
            log.error("이미 승인 또는 반려 된 신청입니다. status={}", application.getStatus());
            throw new BusinessException(ErrorCode.APPLICATION_ALREADY_PROCESSED);
        }

        ApprovalStatus status = dto.getStatus();
        if (status == ApprovalStatus.APPROVED) { // 승인
            application.approve();
            creatorService.createCreator(application.getMember().getId());
            log.info("크리에이터 신청 승인 - app status={}", application.getStatus());
        } else if (status == ApprovalStatus.REJECTED) { // 반려
            application.reject(dto.getRejectReason());
            log.info("크리에이터 신청 반려 - app status={}", application.getStatus());
        }
        return MyCreatorApplicationResponseDTO.create(application);
    }

    // appId로 app조회 - 메서드로 분리
    private CreatorApplication getCreatorApplication(Long applicationId) {
        CreatorApplication application = creatorApplicationRepository.findById(applicationId)
                .orElseThrow(()->{
                    log.error("크리에이터 신청 이력을 찾을 수 없습니다. applicationId={}", applicationId);
                    throw new BusinessException(ErrorCode.APPLICATION_NOT_FOUND);
                }); // todo: 나중에 커스텀 예외로 교체
        return application;
    }
}
