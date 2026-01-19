package com.example.backend.settlement.batch;

import com.example.backend.channel.entity.Channel;
import com.example.backend.channel.repository.ChannelRepository;
import com.example.backend.creator.entity.Creator;
import com.example.backend.creator.repository.CreatorRepository;
import com.example.backend.order.entity.OrderType;
import com.example.backend.payment.entity.Payment;
import com.example.backend.payment.entity.PaymentStatus;
import com.example.backend.payment.service.PaymentService;
import com.example.backend.settlement.entity.Settlement;
import com.example.backend.settlement.entity.SettlementDetail;
import com.example.backend.settlement.repository.SettlementDetailRepository;
import com.example.backend.settlement.repository.SettlementRepository;
import com.example.backend.settlement.service.SettlementPayoutService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class SettlementBatchTasklet implements Tasklet {

    private final PaymentService paymentService;
    private final CreatorRepository creatorRepository;
    private final ChannelRepository channelRepository;
    private final SettlementRepository settlementRepository;
    private final SettlementDetailRepository settlementDetailRepository;
    private final EntityManager entityManager;
    private final SettlementPayoutService settlementPayoutService;

    @Override
    @Transactional
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        log.info("정산 배치 시작");

        // 전월 1일 00:00:00 ~ 전월 말일 23:59:59 계산
        LocalDate today = LocalDate.now();
        LocalDate lastMonthFirstDay = today.minusMonths(1).withDayOfMonth(1);
        LocalDate lastMonthLastDay = today.minusMonths(1).withDayOfMonth(today.minusMonths(1).lengthOfMonth());
        
        LocalDateTime startDateTime = lastMonthFirstDay.atStartOfDay();
        LocalDateTime endDateTime = lastMonthLastDay.atTime(23, 59, 59);
        
        String settlementPeriod = lastMonthFirstDay.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        
        log.info("정산 기간: {} ~ {} ({}월)", startDateTime, endDateTime, settlementPeriod);

        // 전월 PAID 결제 내역 조회 (Creator별로 그룹화) - PaymentService를 통해 접근
        List<Payment> paidPayments = paymentService.findPaidPaymentsInPeriod(
                PaymentStatus.PAID,
                startDateTime, 
                endDateTime
        );
        
        if (paidPayments.isEmpty()) {
            log.info("정산 대상 결제 내역이 없습니다.");
            return RepeatStatus.FINISHED;
        }

        log.info("정산 대상 결제 내역 수: {}", paidPayments.size());

        // Payment를 Creator별로 그룹화
        Map<Long, List<Payment>> paymentsByCreator = paidPayments.stream()
                .collect(Collectors.groupingBy(payment -> {
                    Long creatorId = getCreatorIdFromPayment(payment);
                    if (creatorId == null) {
                        log.warn("Payment ID {}에서 Creator를 찾을 수 없습니다.", payment.getId());
                        return -1L; // Creator를 찾을 수 없는 경우
                    }
                    return creatorId;
                }));

        // Creator별로 정산 처리
        int settlementCount = 0;
        for (Map.Entry<Long, List<Payment>> entry : paymentsByCreator.entrySet()) {
            Long creatorId = entry.getKey();
            if (creatorId == -1L) {
                continue; // Creator를 찾을 수 없는 경우 스킵
            }

            List<Payment> creatorPayments = entry.getValue();
            
            // 이미 해당 기간의 정산이 존재하는지 확인
            Optional<Settlement> existingSettlement = settlementRepository
                    .findByCreatorIdAndSettlementPeriod(creatorId, settlementPeriod);
            
            if (existingSettlement.isPresent()) {
                log.info("Creator ID {}의 {}월 정산이 이미 존재합니다. 스킵합니다.", creatorId, settlementPeriod);
                continue;
            }

            Creator creator = creatorRepository.findById(creatorId)
                    .orElseThrow(() -> new RuntimeException("Creator를 찾을 수 없습니다: " + creatorId));

            // 매출 집계
            Long totalSalesAmount = creatorPayments.stream()
                    .mapToLong(Payment::getAmount)
                    .sum();

            if (totalSalesAmount == 0) {
                log.info("Creator ID {}의 매출이 0원입니다. 정산을 생성하지 않습니다.", creatorId);
                continue;
            }

            // Settlement 생성
            Settlement settlement = Settlement.create(creator, settlementPeriod, totalSalesAmount);
            settlement = settlementRepository.save(settlement);
            
            // 람다에서 사용하기 위해 final 변수로 복사
            final Settlement finalSettlement = settlement;

            // SettlementDetail 생성
            List<SettlementDetail> settlementDetails = creatorPayments.stream()
                    .map(payment -> SettlementDetail.create(finalSettlement, payment, payment.getAmount()))
                    .collect(Collectors.toList());

            settlementDetailRepository.saveAll(settlementDetails);

            log.info("Creator ID {}의 {}월 정산 완료: 총 매출 {}, 실 지급 금액 {}", 
                    creatorId, settlementPeriod, totalSalesAmount, settlement.getPayoutAmount());
            
            // 정산 후처리: 계좌 지급 처리
            boolean payoutSuccess = settlementPayoutService.processPayout(settlement, creator);
            if (!payoutSuccess) {
                log.warn("Creator ID {}의 정산금 지급 실패 - 재시도 스케줄러에서 자동 재시도됩니다.", creatorId);
            }
            
            settlementCount++;
            
            // EntityManager 플러시 (메모리 관리)
            entityManager.flush();
            entityManager.clear();
        }

        log.info("정산 배치 완료: {}명의 크리에이터 정산 처리", settlementCount);
        return RepeatStatus.FINISHED;
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
            if (order.getSubscription() != null) {
                Long channelId = order.getSubscription().getChannelId();
                Channel channel = channelRepository.findById(channelId).orElse(null);
                if (channel != null) {
                    return channel.getCreatorId();
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
}

