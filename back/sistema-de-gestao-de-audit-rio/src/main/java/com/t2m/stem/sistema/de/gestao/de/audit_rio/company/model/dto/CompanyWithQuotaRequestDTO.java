package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

public record CompanyWithQuotaRequestDTO(
        String name,
        String email,
        String cnpj,
        double monthlyLimitHours,
        double consumedHours,
        double additionalHoursApproved
) {
}