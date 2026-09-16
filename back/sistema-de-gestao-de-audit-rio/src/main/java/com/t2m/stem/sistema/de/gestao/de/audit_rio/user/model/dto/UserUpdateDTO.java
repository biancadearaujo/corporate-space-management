package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UserUpdateDTO(
        @NotBlank(message = "The name cannot be empty.")
        String name,

        @Pattern(regexp = "^\\(?(\\d{2})\\)?[\\s-]?(\\d{4,5})[\\s-]?(\\d{4})$", message = "Invalid phone number")
        String phoneNumber) {
}
