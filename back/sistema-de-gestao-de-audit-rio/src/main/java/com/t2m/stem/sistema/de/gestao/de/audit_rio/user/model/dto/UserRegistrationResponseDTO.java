package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.UserRegistrationRequest;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UserRegistrationResponseDTO(
        UUID id,
        String username,
        String status,
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters.")
        String companyName
) {
        public static UserRegistrationResponseDTO from(UserRegistrationRequest request) {
                return new UserRegistrationResponseDTO(
                        request.getId(),
                        request.getUsername(),
                        request.getStatus().name(),
                        request.getCompany().getName()
                );
        }
}
