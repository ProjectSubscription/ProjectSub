package com.example.backend.settlement.service;

import com.example.backend.creator.entity.Creator;
import com.example.backend.creator.repository.CreatorRepository;
import com.example.backend.global.exception.BusinessException;
import com.example.backend.global.exception.ErrorCode;
import com.example.backend.settlement.dto.response.SettlementDetailResponseDTO;
import com.example.backend.settlement.dto.response.SettlementResponseDTO;
import com.example.backend.settlement.dto.response.SettlementStatisticsResponseDTO;
import com.example.backend.settlement.entity.Settlement;
import com.example.backend.settlement.entity.SettlementDetail;
import com.example.backend.settlement.entity.SettlementStatus;
import com.example.backend.settlement.repository.SettlementDetailRepository;
import com.example.backend.settlement.repository.SettlementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.repository.ChannelRepository;
import com.example.backend.order.entity.OrderType;
import com.example.backend.payment.entity.Payment;
import com.example.backend.payment.entity.PaymentStatus;
import com.example.backend.payment.repository.PaymentRepository;
import com.example.backend.subscription.entity.SubscriptionPlan;
import com.example.backend.subscription.repository.SubscriptionPlanRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final SettlementDetailRepository settlementDetailRepository;
    private final CreatorRepository creatorRepository;
    private final SettlementPayoutService settlementPayoutService;
    private final PaymentRepository paymentRepository;
    private final ChannelRepository channelRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Value("${settlement.payout.max-retry-count:3}")
    private int maxRetryCount;

    /**
     * 크리에이터별 정산 목록 조회
     */
    @Transactional(readOnly = true)
    public List<SettlementResponseDTO> getSettlementsByCreatorId(Long creatorId) {
        log.info("크리에이터별 정산 목록 조회 - creatorId: {}", creatorId);

        // 크리에이터 존재 확인
        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(() -> {
                    log.error("크리에이터를 찾을 수 없습니다. creatorId: {}", creatorId);
                    return new BusinessException(ErrorCode.CREATOR_NOT_FOUND);
                });

        // 정산 목록 조회
        List<Settlement> settlements = settlementRepository.findByCreatorIdOrderBySettlementPeriodDesc(creatorId);

        // DTO 변환
        return settlements.stream()
                .map(settlement -> {
                    // 각 정산의 상세 내역 조회
                    List<SettlementDetailResponseDTO> details = settlementDetailRepository
                            .findBySettlementIdWithPayment(settlement.getId())
                            .stream()
                            .map(SettlementDetailResponseDTO::from)
                            .collect(Collectors.toList());

                    return SettlementResponseDTO.from(settlement, details);
                })
                .collect(Collectors.toList());
    }

    /**
     * 정산 상세 조회
     */
    @Transactional(readOnly = true)
    public SettlementResponseDTO getSettlementById(Long settlementId, Long creatorId) {
        log.info("정산 상세 조회 - settlementId: {}, creatorId: {}", settlementId, creatorId);

        // 정산 조회 및 크리에이터 확인
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> {
                    log.error("정산을 찾을 수 없습니다. settlementId: {}", settlementId);
                    return new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
                });

        // 크리에이터 소유 확인
        if (!settlement.getCreator().getId().equals(creatorId)) {
            log.error("정산 접근 권한이 없습니다. settlementId: {}, creatorId: {}", settlementId, creatorId);
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        // 상세 내역 조회
        List<SettlementDetailResponseDTO> details = settlementDetailRepository
                .findBySettlementIdWithPayment(settlementId)
                .stream()
                .map(SettlementDetailResponseDTO::from)
                .collect(Collectors.toList());

        return SettlementResponseDTO.from(settlement, details);
    }

    /**
     * 관리자용: 전체 정산 목록 조회 (필터링, 페이징)
     */
    @Transactional(readOnly = true)
    public Page<SettlementResponseDTO> getAllSettlements(
            Long creatorId,
            String creatorNickname,
            String settlementPeriod,
            SettlementStatus status,
            Pageable pageable
    ) {
        log.info("관리자용 정산 목록 조회 - creatorId: {}, creatorNickname: {}, settlementPeriod: {}, status: {}, page: {}, size: {}",
                creatorId, creatorNickname, settlementPeriod, status, pageable.getPageNumber(), pageable.getPageSize());

        Page<Settlement> settlements;

        // 크리에이터 닉네임으로 검색하는 경우
        if (creatorNickname != null && !creatorNickname.trim().isEmpty()) {
            log.info("크리에이터 닉네임으로 검색: {}", creatorNickname);
            settlements = settlementRepository.findAllByCreatorNickname(
                    creatorNickname.trim(),
                    settlementPeriod,
                    status,
                    pageable
            );
        } else {
            log.info("필터 조건으로 검색 - creatorId: {}, settlementPeriod: {}, status: {}", 
                    creatorId, settlementPeriod, status);
            settlements = settlementRepository.findAllWithFilters(
                    creatorId,
                    settlementPeriod,
                    status,
                    pageable
            );
        }

        log.info("관리자용 정산 목록 조회 결과 - 총 {}건, 현재 페이지 {}건", 
                settlements.getTotalElements(), settlements.getNumberOfElements());

        // DTO 변환 (결제 내역 건수 포함, details는 null로 설정하여 성능 최적화)
        return settlements.map(settlement -> {
            int paymentCount = settlementDetailRepository
                    .findBySettlementIdWithPayment(settlement.getId())
                    .size();
            return SettlementResponseDTO.fromForAdmin(settlement, null, paymentCount);
        });
    }

    /**
     * 관리자용: 정산 상세 조회 (권한 확인 없음)
     */
    @Transactional(readOnly = true)
    public SettlementResponseDTO getSettlementByIdForAdmin(Long settlementId) {
        log.info("관리자용 정산 상세 조회 - settlementId: {}", settlementId);

        // Creator와 Member를 함께 조회
        Settlement settlement = settlementRepository.findByIdWithCreatorAndMember(settlementId)
                .orElseThrow(() -> {
                    log.error("정산을 찾을 수 없습니다. settlementId: {}", settlementId);
                    return new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
                });

        // 상세 내역 조회
        List<SettlementDetailResponseDTO> details = settlementDetailRepository
                .findBySettlementIdWithPayment(settlementId)
                .stream()
                .map(SettlementDetailResponseDTO::from)
                .collect(Collectors.toList());

        // 관리자용 DTO 생성 (크리에이터 정보 포함)
        return SettlementResponseDTO.fromForAdmin(settlement, details, details.size());
    }

    /**
     * 관리자용: 정산 통계 조회
     */
    @Transactional(readOnly = true)
    public SettlementStatisticsResponseDTO getSettlementStatistics() {
        log.info("정산 통계 조회");

        // 이번 주 계산 (이번 주 월요일 ~ 일요일)
        LocalDate today = LocalDate.now();
        DayOfWeek todayDayOfWeek = today.getDayOfWeek();
        int daysToSubtract = todayDayOfWeek.getValue() == 1 ? 0 : todayDayOfWeek.getValue() - 1;
        LocalDate thisWeekMonday = today.minusDays(daysToSubtract);
        LocalDate thisWeekSunday = thisWeekMonday.plusDays(6);
        String thisWeekPeriod = thisWeekMonday.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + 
                                "~" + 
                                thisWeekSunday.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        Long totalSettlementAmount = settlementRepository.getTotalSettlementAmount();
        Long thisWeekSettlementAmount = settlementRepository.getThisWeekSettlementAmount(thisWeekPeriod);
        Long readyCount = settlementRepository.countByStatus(SettlementStatus.READY);
        Long completedCount = settlementRepository.countByStatus(SettlementStatus.COMPLETED);
        Long failedCount = settlementRepository.countByStatus(SettlementStatus.FAILED);
        Long retryNeededCount = settlementRepository.countRetryNeeded(maxRetryCount);

        return SettlementStatisticsResponseDTO.create(
                totalSettlementAmount,
                thisWeekSettlementAmount,
                readyCount,
                completedCount,
                failedCount,
                retryNeededCount
        );
    }

    /**
     * 관리자용: 정산 재시도
     */
    @Transactional
    public boolean retrySettlement(Long settlementId) {
        log.info("관리자용 정산 재시도 - settlementId: {}", settlementId);

        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> {
                    log.error("정산을 찾을 수 없습니다. settlementId: {}", settlementId);
                    return new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
                });

        // FAILED 상태가 아니면 재시도 불가
        if (settlement.getStatus() != SettlementStatus.FAILED) {
            log.warn("FAILED 상태가 아닌 정산은 재시도할 수 없습니다. settlementId: {}, status: {}",
                    settlementId, settlement.getStatus());
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        // 최대 재시도 횟수 초과 확인
        if (settlement.isMaxRetryExceeded(maxRetryCount)) {
            log.warn("최대 재시도 횟수를 초과했습니다. settlementId: {}, retryCount: {}",
                    settlementId, settlement.getRetryCount());
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }

        // 재시도 처리 (관리자 수동 재시도는 대기 시간 없이 즉시 처리)
        // SettlementPayoutService의 processPayout 메서드를 직접 호출
        // 재시도 횟수는 이미 증가되어 있으므로, 바로 지급 처리만 수행
        Creator creator = creatorRepository.findById(settlement.getCreator().getId())
                .orElseThrow(() -> {
                    log.error("크리에이터를 찾을 수 없습니다. creatorId: {}", settlement.getCreator().getId());
                    return new BusinessException(ErrorCode.CREATOR_NOT_FOUND);
                });

        return settlementPayoutService.processPayout(settlement, creator);
    }

    /**
     * 이번달 예상 수익 조회 (크리에이터별)
     * @param creatorId 크리에이터 ID
     * @return 이번달 예상 수익 (수수료 제외)
     */
    @Transactional(readOnly = true)
    public Long getThisMonthExpectedRevenue(Long creatorId) {
        log.info("이번달 예상 수익 조회 - creatorId: {}", creatorId);

        // 크리에이터 존재 확인
        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(() -> {
                    log.error("크리에이터를 찾을 수 없습니다. creatorId: {}", creatorId);
                    return new BusinessException(ErrorCode.CREATOR_NOT_FOUND);
                });

        // 이번달 1일 00:00:00 ~ 오늘 23:59:59 계산
        LocalDate today = LocalDate.now();
        LocalDate thisMonthFirstDay = today.withDayOfMonth(1);
        LocalDateTime startDateTime = thisMonthFirstDay.atStartOfDay();
        LocalDateTime endDateTime = today.atTime(23, 59, 59);

        // 이번달 PAID 결제 내역 조회 (PaymentRepository를 통해 직접 접근)
        List<Payment> paidPayments = paymentRepository.findPaidPaymentsInPeriod(
                PaymentStatus.PAID,
                startDateTime,
                endDateTime
        );

        // 크리에이터별 결제 금액 합계
        Long totalSalesAmount = paidPayments.stream()
                .filter(payment -> {
                    Long paymentCreatorId = getCreatorIdFromPayment(payment);
                    return paymentCreatorId != null && paymentCreatorId.equals(creatorId);
                })
                .mapToLong(Payment::getAmount)
                .sum();

        // 수수료(10%) 제외한 예상 수익 계산
        Long expectedRevenue = (long) (totalSalesAmount * 0.9);

        log.info("이번달 예상 수익 계산 완료 - creatorId: {}, totalSalesAmount: {}, expectedRevenue: {}",
                creatorId, totalSalesAmount, expectedRevenue);

        return expectedRevenue;
    }

    /**
     * 최근 3개월 수익 조회 (크리에이터별)
     * 주간 정산 데이터를 월별로 집계하여 반환
     * @param creatorId 크리에이터 ID
     * @return 최근 3개월 수익 목록 (월, 수수료, 정산상태, 최종 수익금)
     */
    @Transactional(readOnly = true)
    public List<SettlementResponseDTO> getRecentThreeMonthsRevenue(Long creatorId) {
        log.info("최근 3개월 수익 조회 - creatorId: {}", creatorId);

        // 크리에이터 존재 확인
        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(() -> {
                    log.error("크리에이터를 찾을 수 없습니다. creatorId: {}", creatorId);
                    return new BusinessException(ErrorCode.CREATOR_NOT_FOUND);
                });

        // 최근 3개월 기간 계산 (오늘 기준 3개월 전 1일부터 오늘까지)
        LocalDate today = LocalDate.now();
        LocalDate threeMonthsAgo = today.minusMonths(3).withDayOfMonth(1); // 3개월 전 1일
        
        // 최근 3개월 동안의 모든 정산 내역 조회 (주간 정산 포함)
        List<Settlement> allSettlements = settlementRepository.findByCreatorIdOrderBySettlementPeriodDesc(creatorId);
        
        // 최근 3개월 기간에 속하는 정산만 필터링
        List<Settlement> recentSettlements = allSettlements.stream()
                .filter(settlement -> {
                    // settlementPeriod 형식: "yyyy-MM-dd~yyyy-MM-dd"
                    String period = settlement.getSettlementPeriod();
                    if (period == null || !period.contains("~")) {
                        return false;
                    }
                    try {
                        String startDateStr = period.split("~")[0];
                        LocalDate startDate = LocalDate.parse(startDateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                        return !startDate.isBefore(threeMonthsAgo);
                    } catch (Exception e) {
                        log.warn("정산 기간 파싱 실패 - settlementId: {}, period: {}", settlement.getId(), period);
                        return false;
                    }
                })
                .collect(Collectors.toList());

        // 월별로 그룹화하여 집계
        Map<String, List<Settlement>> settlementsByMonth = recentSettlements.stream()
                .collect(Collectors.groupingBy(settlement -> {
                    String period = settlement.getSettlementPeriod();
                    String startDateStr = period.split("~")[0];
                    LocalDate startDate = LocalDate.parse(startDateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                    return startDate.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                }));

        // 최근 3개월 월 목록 생성 (최신순)
        List<String> recentMonths = List.of(
                today.format(DateTimeFormatter.ofPattern("yyyy-MM")),
                today.minusMonths(1).format(DateTimeFormatter.ofPattern("yyyy-MM")),
                today.minusMonths(2).format(DateTimeFormatter.ofPattern("yyyy-MM"))
        );

        // 월별로 집계하여 DTO 생성
        List<SettlementResponseDTO> result = recentMonths.stream()
                .map(month -> {
                    List<Settlement> monthSettlements = settlementsByMonth.getOrDefault(month, List.of());
                    if (monthSettlements.isEmpty()) {
                        return null; // 해당 월에 정산 데이터가 없으면 null 반환
                    }
                    
                    // 해당 월의 모든 정산 금액 합계
                    Long totalSalesAmount = monthSettlements.stream()
                            .mapToLong(Settlement::getTotalSalesAmount)
                            .sum();
                    Long platformFeeAmount = monthSettlements.stream()
                            .mapToLong(Settlement::getPlatformFeeAmount)
                            .sum();
                    Long payoutAmount = monthSettlements.stream()
                            .mapToLong(Settlement::getPayoutAmount)
                            .sum();
                    
                    // 가장 최근 정산의 상태를 사용 (또는 COMPLETED가 있으면 COMPLETED 우선)
                    SettlementStatus status = monthSettlements.stream()
                            .filter(s -> s.getStatus() == SettlementStatus.COMPLETED)
                            .findFirst()
                            .map(Settlement::getStatus)
                            .orElse(monthSettlements.get(0).getStatus());
                    
                    // 집계된 데이터로 SettlementResponseDTO 생성
                    return SettlementResponseDTO.fromAggregated(
                            month,
                            totalSalesAmount,
                            platformFeeAmount,
                            payoutAmount,
                            status
                    );
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());

        log.info("최근 3개월 수익 조회 완료 - creatorId: {}, count: {}", creatorId, result.size());

        return result;
    }

    /**
     * 결제 완료 시 정산 내역 생성 또는 업데이트
     * @param payment 결제 완료된 Payment
     */
    @Transactional
    public void processSettlementForPayment(Payment payment) {
        log.info("결제 완료 시 정산 처리 시작 - paymentId: {}, paymentKey: {}, amount: {}", 
                payment.getId(), payment.getPaymentKey(), payment.getAmount());

        // Payment에서 Creator ID 추출
        Long creatorId = getCreatorIdFromPayment(payment);
        if (creatorId == null) {
            log.warn("Payment ID {}에서 Creator를 찾을 수 없습니다. 정산 처리를 스킵합니다.", payment.getId());
            return;
        }

        // 정산 기간 계산 (결제 승인일이 속한 주의 월요일~일요일)
        LocalDate paymentDate = payment.getApprovedAt() != null 
                ? payment.getApprovedAt().toLocalDate() 
                : LocalDate.now();
        
        // 결제일이 속한 주의 월요일 찾기
        DayOfWeek paymentDayOfWeek = paymentDate.getDayOfWeek();
        int daysToSubtract = paymentDayOfWeek.getValue() == 1 ? 0 : paymentDayOfWeek.getValue() - 1;
        LocalDate weekMonday = paymentDate.minusDays(daysToSubtract);
        LocalDate weekSunday = weekMonday.plusDays(6);
        
        // 정산 기간 형식: "2024-01-01~2024-01-07"
        String settlementPeriod = weekMonday.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + 
                                  "~" + 
                                  weekSunday.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        log.info("정산 처리 - creatorId: {}, settlementPeriod: {}, paymentAmount: {}", 
                creatorId, settlementPeriod, payment.getAmount());

        // 크리에이터 조회
        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(() -> {
                    log.error("크리에이터를 찾을 수 없습니다. creatorId: {}", creatorId);
                    return new BusinessException(ErrorCode.CREATOR_NOT_FOUND);
                });

        // 해당 기간의 정산이 존재하는지 확인
        java.util.Optional<Settlement> existingSettlementOpt = settlementRepository
                .findByCreatorIdAndSettlementPeriod(creatorId, settlementPeriod);

        Settlement settlement;
        if (existingSettlementOpt.isPresent()) {
            // 기존 정산이 있으면 금액 업데이트
            settlement = existingSettlementOpt.get();
            settlement.addSalesAmount(payment.getAmount());
            settlementRepository.save(settlement);
            log.info("기존 정산 업데이트 - settlementId: {}, 새로운 총 매출: {}", 
                    settlement.getId(), settlement.getTotalSalesAmount());
        } else {
            // 기존 정산이 없으면 새로 생성
            settlement = Settlement.create(creator, settlementPeriod, payment.getAmount());
            settlement = settlementRepository.save(settlement);
            log.info("새 정산 생성 - settlementId: {}, 총 매출: {}", 
                    settlement.getId(), settlement.getTotalSalesAmount());
        }

        // SettlementDetail 생성 (중복 체크)
        boolean detailExists = settlementDetailRepository.existsBySettlementIdAndPaymentId(
                settlement.getId(), payment.getId());
        
        if (!detailExists) {
            SettlementDetail settlementDetail = SettlementDetail.create(
                    settlement, payment, payment.getAmount());
            settlementDetailRepository.save(settlementDetail);
            log.info("정산 상세 내역 추가 - settlementDetailId: {}, paymentId: {}", 
                    settlementDetail.getId(), payment.getId());
        } else {
            log.info("정산 상세 내역이 이미 존재합니다. 스킵 - paymentId: {}", payment.getId());
        }

        log.info("결제 완료 시 정산 처리 완료 - settlementId: {}, creatorId: {}, settlementPeriod: {}", 
                settlement.getId(), creatorId, settlementPeriod);
    }

    /**
     * Payment에서 Creator ID를 추출
     * Order -> Subscription/Content -> Channel -> Creator
     */
    private Long getCreatorIdFromPayment(Payment payment) {
        if (payment.getOrder() == null) {
            return null;
        }

        var order = payment.getOrder();

        // OrderType이 SUBSCRIPTION인 경우
        if (order.getOrderType() == OrderType.SUBSCRIPTION) {
            // 먼저 subscription이 연결되어 있는지 확인
            if (order.getSubscription() != null) {
                Long channelId = order.getSubscription().getChannelId();
                Channel channel = channelRepository.findById(channelId).orElse(null);
                if (channel != null) {
                    return channel.getCreatorId();
                }
            }
            // subscription이 아직 연결되지 않은 경우 planId를 통해 조회
            if (order.getPlanId() != null) {
                SubscriptionPlan plan = subscriptionPlanRepository.findById(order.getPlanId()).orElse(null);
                if (plan != null) {
                    Channel channel = channelRepository.findById(plan.getChannelId()).orElse(null);
                    if (channel != null) {
                        return channel.getCreatorId();
                    }
                }
            }
        }

        // OrderType이 CONTENT인 경우
        if (order.getOrderType() == OrderType.CONTENT) {
            if (order.getContent() != null && order.getContent().getChannel() != null) {
                return order.getContent().getChannel().getCreatorId();
            }
        }

        return null;
    }

    /**
     * 결제 취소 시 정산 처리
     * - 정산 처리 전 취소: SettlementDetail 삭제, Settlement 금액 차감
     * - 정산 처리 후 취소: 다음 주차 정산 금액에서 차감
     * @param payment 취소된 결제
     */
    @Transactional
    public void handleCancelledPayment(Payment payment) {
        log.info("결제 취소로 인한 정산 처리 시작 - paymentId: {}", payment.getId());

        // 해당 결제가 포함된 정산 상세 내역 조회
        List<SettlementDetail> settlementDetails = settlementDetailRepository.findByPaymentId(payment.getId());

        if (settlementDetails.isEmpty()) {
            log.info("결제 ID {}에 대한 정산 상세 내역이 없습니다. 정산 조정이 필요하지 않습니다.", payment.getId());
            return;
        }

        log.info("결제 ID {}에 대한 정산 상세 내역 수: {}건", payment.getId(), settlementDetails.size());

        // 각 정산 상세 내역에 대해 정산 금액 조정
        for (SettlementDetail detail : settlementDetails) {
            Settlement settlement = detail.getSettlement();
            Long cancelledAmount = detail.getAmount();

            log.info("정산 금액 조정 - Settlement ID: {}, 상태: {}, 취소 금액: {}", 
                    settlement.getId(), settlement.getStatus(), cancelledAmount);

            // 정산 상태에 따라 처리 분기
            if (settlement.getStatus() == SettlementStatus.COMPLETED) {
                // 정산 처리 후 취소: 다음 주차 정산 금액에서 차감
                handlePostSettlementCancellation(settlement, cancelledAmount, payment);
            } else {
                // 정산 처리 전 취소: SettlementDetail 삭제, Settlement 금액 차감
                settlement.subtractSalesAmount(cancelledAmount);
                settlementRepository.save(settlement);
                log.info("정산 금액 차감 완료 - Settlement ID: {}, 조정 후 총 매출: {}, 실 지급 금액: {}",
                        settlement.getId(), settlement.getTotalSalesAmount(), settlement.getPayoutAmount());
            }

            // SettlementDetail 삭제
            settlementDetailRepository.delete(detail);
            log.info("정산 상세 내역 삭제 완료 - SettlementDetail ID: {}", detail.getId());
        }

        log.info("결제 취소로 인한 정산 처리 완료 - paymentId: {}", payment.getId());
    }

    /**
     * 정산 처리 후 취소 시 다음 주차 정산 금액에서 차감
     * @param completedSettlement 완료된 정산
     * @param cancelledAmount 취소 금액
     * @param payment 취소된 결제
     */
    private void handlePostSettlementCancellation(Settlement completedSettlement, Long cancelledAmount, Payment payment) {
        log.info("정산 완료 후 취소 처리 시작 - Settlement ID: {}, 취소 금액: {}", 
                completedSettlement.getId(), cancelledAmount);

        // 결제 승인일 기준으로 다음 주차 계산
        LocalDate paymentDate = payment.getApprovedAt() != null 
                ? payment.getApprovedAt().toLocalDate() 
                : LocalDate.now();
        
        // 결제일이 속한 주의 월요일 찾기
        DayOfWeek paymentDayOfWeek = paymentDate.getDayOfWeek();
        int daysToSubtract = paymentDayOfWeek.getValue() == 1 ? 0 : paymentDayOfWeek.getValue() - 1;
        LocalDate weekMonday = paymentDate.minusDays(daysToSubtract);
        
        // 다음 주차 월요일
        LocalDate nextWeekMonday = weekMonday.plusDays(7);
        LocalDate nextWeekSunday = nextWeekMonday.plusDays(6);
        
        // 다음 주차 정산 기간 형식: "2024-01-08~2024-01-14"
        String nextWeekPeriod = nextWeekMonday.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + 
                               "~" + 
                               nextWeekSunday.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        log.info("다음 주차 정산 기간: {}", nextWeekPeriod);

        // 다음 주차 정산 조회 또는 생성
        Long creatorId = completedSettlement.getCreator().getId();
        java.util.Optional<Settlement> nextWeekSettlementOpt = settlementRepository
                .findByCreatorIdAndSettlementPeriod(creatorId, nextWeekPeriod);

        Settlement nextWeekSettlement;
        if (nextWeekSettlementOpt.isPresent()) {
            // 다음 주차 정산이 이미 존재하면 금액 차감
            nextWeekSettlement = nextWeekSettlementOpt.get();
            nextWeekSettlement.subtractSalesAmount(cancelledAmount);
            settlementRepository.save(nextWeekSettlement);
            log.info("다음 주차 정산 금액 차감 완료 - Settlement ID: {}, 차감 후 총 매출: {}, 실 지급 금액: {}",
                    nextWeekSettlement.getId(), nextWeekSettlement.getTotalSalesAmount(), nextWeekSettlement.getPayoutAmount());
        } else {
            // 다음 주차 정산이 없으면 차감 금액을 반영하여 생성
            // 음수 금액이 될 수 있으므로 0과 비교하여 최소값 보장
            Creator creator = creatorRepository.findById(creatorId)
                    .orElseThrow(() -> {
                        log.error("크리에이터를 찾을 수 없습니다. creatorId: {}", creatorId);
                        return new BusinessException(ErrorCode.CREATOR_NOT_FOUND);
                    });
            
            // 차감 금액을 반영하여 다음 주차 정산 생성
            // totalSalesAmount가 음수가 될 수 있지만, 다음 주차에 다른 결제가 있으면 자동으로 상쇄됨
            Long initialAmount = -cancelledAmount;
            nextWeekSettlement = Settlement.create(creator, nextWeekPeriod, initialAmount);
            nextWeekSettlement = settlementRepository.save(nextWeekSettlement);
            log.info("다음 주차 정산 생성 (차감 금액 반영) - Settlement ID: {}, 총 매출: {}, 실 지급 금액: {}",
                    nextWeekSettlement.getId(), nextWeekSettlement.getTotalSalesAmount(), nextWeekSettlement.getPayoutAmount());
        }
    }
}

