package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AssignEmployeeToCompanyDTO(
        @NotNull(message = "Email cannot be null.")
        @Email(message = "Email should be valid.")
        String email,

        @NotNull(message = "Company ID cannot be null.")
        UUID companyId
) {
}
