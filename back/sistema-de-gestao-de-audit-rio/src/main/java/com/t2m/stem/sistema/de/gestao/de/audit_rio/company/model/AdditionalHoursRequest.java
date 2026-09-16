package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.AdditionalHoursRequestStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
public class AdditionalHoursRequest {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID additionalHoursRequestId;
    private UUID companyId;
    private UUID requesterId;
    private double requestedHours;
    private String justification;

    @Enumerated(EnumType.STRING)
    private AdditionalHoursRequestStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isApproved;
}