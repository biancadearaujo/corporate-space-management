package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.AdditionalHoursRequestStatus;

import java.util.UUID;

public record ReviewRequestDTO(
        UUID additionalHoursRequestId,
        Boolean isApproved,
        AdditionalHoursRequestStatus status,
        String comments
) {
}
