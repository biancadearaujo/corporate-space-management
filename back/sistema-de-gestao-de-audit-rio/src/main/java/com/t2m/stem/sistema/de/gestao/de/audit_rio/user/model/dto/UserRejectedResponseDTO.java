package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.UserRejectedRequest;
import jakarta.validation.constraints.Size;

public record UserRejectedResponseDTO(
        String username,
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters.")
        String companyName
) {
        public static UserRejectedResponseDTO from(UserRejectedRequest userRejectedRequest) {
                return new UserRejectedResponseDTO(
                        userRejectedRequest.getUsername(),
                        userRejectedRequest.getCompany().getName()
                );
        }
}
