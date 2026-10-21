package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.ApprovalAction;

import java.time.LocalDateTime;
import java.util.UUID;

public record HoursApprovalRequestDTO(
        UUID requestId,
        UUID approvedBy,
        UUID companyId,
        ApprovalAction action,
        String comments,
        LocalDateTime actionDate
) {
}