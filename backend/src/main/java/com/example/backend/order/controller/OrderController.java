package com.example.backend.order.controller;

import com.example.backend.order.dto.OrderCreateRequestDTO;
import com.example.backend.order.dto.OrderCreateResponseDTO;
import com.example.backend.order.dto.OrderListResponseDTO;
import com.example.backend.order.dto.OrderResponseDTO;
import com.example.backend.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * 주문 생성
     * POST /api/orders
     * 권한: 회원 (USER)
     */
    @PostMapping
    public ResponseEntity<OrderCreateResponseDTO> createOrder(
            @Valid @RequestBody OrderCreateRequestDTO request,
            @RequestHeader(value = "User-Id", required = false) Long userId
    ) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        OrderCreateResponseDTO response = orderService.createOrder(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 주문 단건 조회 (주문 코드로)
     * GET /api/orders/code/{orderCode}
     * 권한: 회원 (USER) - 본인 주문만 조회 가능
     */
    @GetMapping("/code/{orderCode}")
    public ResponseEntity<OrderResponseDTO> getOrderByOrderCode(
            @PathVariable String orderCode,
            @RequestHeader(value = "User-Id", required = false) Long userId
    ) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        OrderResponseDTO response = orderService.getOrderByOrderCode(orderCode);
        
        // 본인 주문만 조회 가능하도록 검증
        if (!response.getMemberId().equals(userId)) {
            throw new IllegalArgumentException("본인의 주문만 조회할 수 있습니다.");
        }

        return ResponseEntity.ok(response);
    }

    /**
     * 주문 단건 조회 (ID로)
     * GET /api/orders/{orderId}
     * 권한: 회원 (USER) - 본인 주문만 조회 가능
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderById(
            @PathVariable Long orderId,
            @RequestHeader(value = "User-Id", required = false) Long userId
    ) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        OrderResponseDTO response = orderService.getOrderById(orderId);
        
        // 본인 주문만 조회 가능하도록 검증
        if (!response.getMemberId().equals(userId)) {
            throw new IllegalArgumentException("본인의 주문만 조회할 수 있습니다.");
        }

        return ResponseEntity.ok(response);
    }

    /**
     * 회원별 주문 목록 조회
     * GET /api/orders/member/{memberId}
     * 권한: 회원 (USER) - 본인 주문만 조회 가능
     */
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<OrderListResponseDTO>> getOrdersByMemberId(
            @PathVariable Long memberId,
            @RequestHeader(value = "User-Id", required = false) Long userId
    ) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        // 본인 주문만 조회 가능하도록 검증
        if (!memberId.equals(userId)) {
            throw new IllegalArgumentException("본인의 주문만 조회할 수 있습니다.");
        }

        List<OrderListResponseDTO> response = orderService.getOrdersByMemberId(memberId);
        return ResponseEntity.ok(response);
    }

    /**
     * 회원별 주문 목록 조회 (페이징)
     * GET /api/orders/member/{memberId}/page
     * 권한: 회원 (USER) - 본인 주문만 조회 가능
     */
    @GetMapping("/member/{memberId}/page")
    public ResponseEntity<Page<OrderListResponseDTO>> getOrdersByMemberIdWithPaging(
            @PathVariable Long memberId,
            @RequestHeader(value = "User-Id", required = false) Long userId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        // 본인 주문만 조회 가능하도록 검증
        if (!memberId.equals(userId)) {
            throw new IllegalArgumentException("본인의 주문만 조회할 수 있습니다.");
        }

        Page<OrderListResponseDTO> response = orderService.getOrdersByMemberId(memberId, pageable);
        return ResponseEntity.ok(response);
    }
}
