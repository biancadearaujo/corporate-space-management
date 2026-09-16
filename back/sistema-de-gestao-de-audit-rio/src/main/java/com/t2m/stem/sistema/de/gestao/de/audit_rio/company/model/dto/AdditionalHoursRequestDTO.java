package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.AdditionalHoursRequestStatus;

import java.util.UUID;

public record AdditionalHoursRequestDTO(
        UUID additionalHoursRequestId,
        UUID companyId,
        UUID requesterId,
        double requestedHours,
        String justification,
        String comments,
        AdditionalHoursRequestStatus status,
        boolean isApproved
) {
}