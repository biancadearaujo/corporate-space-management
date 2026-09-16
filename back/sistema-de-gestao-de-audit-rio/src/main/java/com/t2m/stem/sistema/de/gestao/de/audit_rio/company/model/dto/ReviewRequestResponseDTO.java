package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.AdditionalHoursRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.AdditionalHoursRequestStatus;

import java.util.UUID;

public record ReviewRequestResponseDTO(
        UUID additionalHoursRequestId,
        UUID companyId,
        UUID requesterId,
        double requestedHours,
        String justification,
        AdditionalHoursRequestStatus status,
        boolean isApproved,
        String companyName // O campo novo
) {
    public static ReviewRequestResponseDTO from(AdditionalHoursRequest request, String companyName) {
        return new ReviewRequestResponseDTO(
                request.getAdditionalHoursRequestId(),
                request.getCompanyId(),
                request.getRequesterId(),
                request.getRequestedHours(),
                request.getJustification(),
                request.getStatus(),
                request.isApproved(),
                companyName
        );
    }
}