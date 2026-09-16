package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

public record CompanyRequestDTO(
        String name,
        String email,
        String cnpj
        ) {
}