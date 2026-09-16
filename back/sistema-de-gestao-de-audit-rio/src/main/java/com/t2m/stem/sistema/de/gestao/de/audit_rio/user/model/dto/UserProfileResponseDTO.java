package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;

import java.util.UUID;

public record UserProfileResponseDTO(
        UUID id,
        String name,
        String email,
        String phone,
        String role,
        String department,
        String companyName
) {
    public static UserProfileResponseDTO from(User user) {
        return new UserProfileResponseDTO(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole().name(),
                user.getDepartment(),
                user.getCompany() != null ? user.getCompany().getName() : "Sem Empresa"
        );
    }
}