package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.UserRole;

import java.util.UUID;

public record UserResponseDTO(
        UUID id,
        String name,
        String email,
        String phone,
        String role,
        String department,
        String companyName
) {
    public static UserResponseDTO from(User user) {
        return new UserResponseDTO(
                user.getUserId(),
                user.getUsername()!= null ? user.getUsername() : "Sem Nome",
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole().name(),
                user.getDepartment(),
                user.getCompany() != null ? user.getCompany().getName() : "Sem Empresa"
        );
    }
}
