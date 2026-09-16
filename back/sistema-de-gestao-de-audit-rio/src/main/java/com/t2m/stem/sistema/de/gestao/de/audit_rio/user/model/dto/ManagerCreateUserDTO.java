package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto;

public record ManagerCreateUserDTO(
        String username,
        String email,
        String cpf,
        String rgNumber,
        String phoneNumber,
        String password
) {
}
