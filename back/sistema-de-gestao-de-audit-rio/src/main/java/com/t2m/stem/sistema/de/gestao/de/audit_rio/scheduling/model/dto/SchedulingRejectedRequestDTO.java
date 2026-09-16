package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.Equipment;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record SchedulingRejectedRequestDTO(
        @NotNull(message = "Name cannot be null.")
        String name,

        @NotNull(message = "Description cannot be null.")
        String description,

        @NotNull(message = "Start at cannot be null.")
        LocalDateTime startAt,

        LocalDateTime updateAt,

        @NotNull(message = "End at cannot be null.")
        LocalDateTime endAt,

        @NotNull(message = "Create at cannot be null.")
        LocalDateTime createdAt,

        Company company,
        Venue venue,
        SubVenue subVenue,
        Set<Equipment> equipments,

        @NotNull
        UUID managerId,

        @NotNull
        LocalDateTime decidedAt,

        String rejectionReason
) {
}
