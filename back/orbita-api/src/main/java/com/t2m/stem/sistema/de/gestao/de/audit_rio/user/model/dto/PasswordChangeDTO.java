package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordChangeDTO(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 6, message = "The password must be at least 6 characters long.") String newPassword
) {
}
