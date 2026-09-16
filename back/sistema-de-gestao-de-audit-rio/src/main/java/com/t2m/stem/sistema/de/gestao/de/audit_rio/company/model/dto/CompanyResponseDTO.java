package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public record CompanyResponseDTO(
        UUID companyId,
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters.")
        String name,
        String cnpj,
        String email,
        LocalDateTime createdAt
) {
        public static CompanyResponseDTO from(Company company) {
                return new CompanyResponseDTO(
                        company.getCompanyId(),
                        company.getName(),
                        company.getCnpj(),
                        company.getEmail(),
                        company.getCreatedAt()
                );
        }
}