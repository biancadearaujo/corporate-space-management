package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CompanyQuotaRequestDTO(
        UUID companyId,
        double monthlyLimitHours,
        double consumedHours,
        double additionalHoursApproved,
        LocalDateTime updatedAt
) {
}