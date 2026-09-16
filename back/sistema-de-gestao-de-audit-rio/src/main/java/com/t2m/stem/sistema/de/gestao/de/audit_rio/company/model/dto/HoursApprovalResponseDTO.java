package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.HoursApprovalHistory;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.ApprovalAction;

import java.time.LocalDateTime;
import java.util.UUID;

public record HoursApprovalResponseDTO(
        UUID requestId,
        UUID approvedBy,
        UUID companyId,
        ApprovalAction action,
        String comments,
        LocalDateTime actionDate
) {
    public static HoursApprovalResponseDTO from(HoursApprovalHistory hoursApprovalHistory) {
        return new HoursApprovalResponseDTO(
                hoursApprovalHistory.getRequestId(),
                hoursApprovalHistory.getApprovedBy(),
                hoursApprovalHistory.getCompanyId(),
                hoursApprovalHistory.getAction(),
                hoursApprovalHistory.getComments(),
                hoursApprovalHistory.getActionDate()
        );
    }
}