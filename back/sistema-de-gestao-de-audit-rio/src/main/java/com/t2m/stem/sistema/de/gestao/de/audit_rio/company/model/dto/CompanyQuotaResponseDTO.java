package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.CompanyHoursQuota;

import java.time.LocalDateTime;
import java.util.UUID;

public record CompanyQuotaResponseDTO(
        UUID companyId,
        double monthlyLimitHours,
        double additionalHoursApproved,
        LocalDateTime updatedAt
) {
    public static CompanyQuotaResponseDTO from(CompanyHoursQuota companyQuota) {
        return new CompanyQuotaResponseDTO(
                companyQuota.getCompanyHoursQuotaId(),
                companyQuota.getMonthlyLimitHours(),
                companyQuota.getAdditionalHoursApproved(),
                companyQuota.getUpdatedAt()
        );
    }
}