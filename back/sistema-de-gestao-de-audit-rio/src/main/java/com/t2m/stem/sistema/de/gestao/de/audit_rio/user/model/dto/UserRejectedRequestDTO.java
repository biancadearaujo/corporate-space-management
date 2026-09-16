package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.RequestStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.URL;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserRejectedRequestDTO(
        @NotNull(message = "Username cannot be null.")
        String username,

        @NotNull(message = "Email cannot be null.")
        @Email(message = "Email should be valid.")
        String email,

        @NotNull(message = "Password cannot be null.")
        String password,

        @NotNull(message = "CPF cannot be null.")
        @CPF
        String cpf,

        @URL(message = "Photo URL should be valid.")
        String photoUrl,

        @NotNull(message = "Phone number cannot be null.")
        String phoneNumber,

        @NotNull(message = "RG number cannot be null.")
        String rgNumber,

        @NotNull(message = "Company ID cannot be null.")
        UUID companyId,

        @NotNull(message = "Role cannot be null.")
        RequestStatus status,

        @NotNull(message = "Manager cannot be null.")
        UUID managerId,

        @NotNull
        LocalDateTime decidedAt,

        String rejectionReason
) {
}
