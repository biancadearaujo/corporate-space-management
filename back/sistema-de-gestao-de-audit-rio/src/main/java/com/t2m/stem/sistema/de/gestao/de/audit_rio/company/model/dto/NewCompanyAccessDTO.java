package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record NewCompanyAccessDTO(
        @NotBlank(message = "A CNPJ is required.")
        String cnpj,

        @NotBlank(message = "An email address is required for the new account.")
        @Email(message = "Invalid email format")
        String newEmail
) {
}
