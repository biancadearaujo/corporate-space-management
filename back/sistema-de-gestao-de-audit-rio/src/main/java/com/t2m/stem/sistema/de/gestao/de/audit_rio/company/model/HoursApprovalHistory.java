package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.ApprovalAction;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
public class HoursApprovalHistory {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID hoursApprovalHistoryId;
    private UUID requestId;
    private UUID approvedBy;
    private UUID companyId;

    @Enumerated(EnumType.STRING)
    private ApprovalAction action;

    private String comments;
    private LocalDateTime actionDate;
}
