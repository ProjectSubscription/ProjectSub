package com.example.backend.creator.service;

import com.example.backend.creator.dto.response.CreatorMyPageResponseDTO;
import com.example.backend.creator.dto.response.CreatorResponseDTO;
import com.example.backend.creator.entity.Creator;
import com.example.backend.creator.repository.CreatorRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.member.entity.Member;
import com.example.backend.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CreatorService {

    private final CreatorRepository creatorRepository;
    private final MemberService memberService;

    // 관리자가 승인했을 때 호출
    public void createCreator(Long memberId) {

        log.info("크리에이터 생성 start - memberId={}", memberId);

        Member member = null;
        // Member member =  memberService.memberToCreator(memberId);

        Creator creator = Creator.create(member);

        Creator saveCreator = creatorRepository.save(creator);

        log.info("크리에이터 생성 완료 - creatorId={}, memberId={}", saveCreator.getId(), memberId);

    }

    // 공개용 크리에이터 정보 조회
    public CreatorResponseDTO getCreatorInfo(Long memberId, Long creatorId) {

        log.info("크리에이터 공개용 정보조회 - memberId={}, creatorId={}", memberId, creatorId);

        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(()->{
                    log.error("크리에이터를 찾을 수 없습니다. creatorId={}", creatorId);
                    throw new BusinessException(ErrorCode.CREATOR_NOT_FOUND);
                });

        // 채널 관련 dto 추가 예정
        // 구독자 통계 dto 추가 예정
        // 활동지표 dto ( 최근 5일 발행 콘텐츠 수) 추가 예정

        return CreatorResponseDTO.create(creator);
    }

    // 크리에이터 마이페이지 조회
    public CreatorMyPageResponseDTO getCreatorMyPage(Long memberId) {

        log.info("크리에이터 마이페이지 조회 - memberId={}", memberId);

        Creator creator = creatorRepository.findByMemberId(memberId)
                .orElseThrow(()->{
                    log.error("크리에이터를 찾을 수 없습니다. memberId={}", memberId);
                    throw new BusinessException(ErrorCode.CREATOR_NOT_FOUND);
                });

        // 총 구독자 추가 예정
        // 정산 관련 dto 추가 예정
        // 콘텐츠 관련 dto 추가 예정

        return CreatorMyPageResponseDTO.create(creator);
    }

    // 크리에이터 인지 검증
    public boolean isCreator(Long memberId) {
        return creatorRepository.existsByMemberId(memberId);
    }


}
