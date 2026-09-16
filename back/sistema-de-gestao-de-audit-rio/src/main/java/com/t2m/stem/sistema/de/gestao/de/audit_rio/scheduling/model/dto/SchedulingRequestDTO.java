package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record SchedulingRequestDTO(
        @NotNull(message = "Name cannot be null.")
        String name,

        @NotNull(message = "Description cannot be null.")
        String description,

        @NotNull(message = "Start at cannot be null.")
        LocalDateTime startAt,

        @NotNull(message = "End at cannot be null.")
        LocalDateTime endAt,

        @NotNull(message = "Create at cannot be null.")
        LocalDateTime createdAt,

        @NotNull(message = "Create by cannot be null.")
        UUID createdBy,

        @NotNull(message = "Company ID cannot be null.")
        UUID companyId,

        @NotNull(message = "Venue ID cannot be null.")
        UUID venueId,

        @NotNull(message = "Equipment ID cannot be null.")
        UUID equipmentsId,

        LocalDateTime updateAt
) {
}
