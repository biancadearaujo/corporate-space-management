package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.CompanyHoursQuota;

import java.util.UUID;

public record CompanyWithQuotaResponseDTO(
        UUID companyId,
        String name,
        String email,
        String cnpj,
        double monthlyLimitHours,
        double additionalHoursApproved

) {
    public static CompanyWithQuotaResponseDTO from(CompanyHoursQuota quota) {
        Company company = quota.getCompany();

        return new CompanyWithQuotaResponseDTO(
                company.getCompanyId(),
                company.getName(),
                company.getEmail(),
                company.getCnpj(),
                quota.getMonthlyLimitHours(),
                quota.getAdditionalHoursApproved()
        );
    }
}