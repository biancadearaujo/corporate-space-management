package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.BookingPeriod;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record SchedulingUpdateDTO(
        String name,
        String description,
        LocalDateTime startAt,
        LocalDateTime endAt,
        LocalDateTime createdAt,
        UUID companyId,
        UUID venueId,
        UUID equipmentsId,
        SchedulingRequestStatus status,
        UUID decidedBy,
        Instant decidedAt,
        String rejectionReason,
        BookingPeriod BookingPeriod,
        LocalDateTime updateAt,
        UUID subVenueId
) {
}
