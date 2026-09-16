package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto;

import jakarta.validation.constraints.Email;

import java.util.UUID;

public record AssignManagerDTO(
        @Email String email,
        UUID targetCompanyId
) {
}
