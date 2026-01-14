package com.example.backend.order.controller;

import com.example.backend.order.dto.OrderCreateRequestDTO;
import com.example.backend.order.dto.OrderCreateResponseDTO;
import com.example.backend.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
