package com.example.backend.creatorapplication.dto.request;

import com.example.backend.creatorapplication.entity.ApprovalStatus;
import lombok.Getter;

@Getter
public class ApprovalRequestDTO {
    private ApprovalStatus status;
    private String rejectReason;
}
