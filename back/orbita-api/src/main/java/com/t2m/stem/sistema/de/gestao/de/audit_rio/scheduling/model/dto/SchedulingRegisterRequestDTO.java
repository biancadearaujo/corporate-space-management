package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.BookingPeriod;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SchedulingRegisterRequestDTO(
        @NotNull(message = "Name cannot be null.")
        String name,

        @NotNull(message = "Description cannot be null.")
        String description,

        @NotNull(message = "Start at cannot be null.")
        LocalDateTime startAt,

        @NotNull(message = "End at cannot be null.")
        LocalDateTime endAt,

        //@NotNull(message = "Create at cannot be null.")
        LocalDateTime createdAt,

        @NotNull(message = "Create by cannot be null.")
        UUID createdBy,

       // @NotNull(message = "Company ID cannot be null.")
        UUID companyId,

        @NotNull(message = "Venue ID cannot be null.")
        UUID venueId,

        //@NotNull(message = "Equipment ID cannot be null.")
        UUID equipmentsId,

        //@NotNull(message = "Status cannot be null.")
        SchedulingRequestStatus status,

       // @NotNull(message = "Manager ID cannot be null.")
        UUID decidedBy,

        //@NotNull(message = "Decision date cannot be null.")
        Instant decidedAt,

        String rejectionReason,
        BookingPeriod bookingPeriod,
        LocalDateTime updateAt,
        UUID subVenueId,
        List<UUID> equipmentIds
) {
}