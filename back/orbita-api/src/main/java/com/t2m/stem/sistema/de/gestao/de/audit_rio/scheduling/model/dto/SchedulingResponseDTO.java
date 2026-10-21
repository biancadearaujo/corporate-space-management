package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.Equipment;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.Scheduling;

import java.time.LocalDateTime;
import java.util.UUID;

public record SchedulingResponseDTO(
        UUID schedulingId,
        String name,
        String description,
        LocalDateTime startAt,
        LocalDateTime endAt,
        LocalDateTime createdAt,
        UUID createdBy,
        UUID companyId,
        UUID venueId,
        String venueName,
        UUID equipmentsId,
        LocalDateTime updateAt,
        String cnpj,
        boolean isOwnCompany
) {
    public static SchedulingResponseDTO from(Scheduling scheduling) {
        return new SchedulingResponseDTO(
                scheduling.getSchedulingId(),
                scheduling.getName(),
                scheduling.getDescription(),
                scheduling.getStartAt(),
                scheduling.getEndAt(),
                scheduling.getCreatedAt(),
                scheduling.getCreatedBy(),
                scheduling.getCompany() != null ? scheduling.getCompany().getCompanyId() : null,
                scheduling.getVenue() != null ? scheduling.getVenue().getVenueId() : null,
                scheduling.getVenue() != null ? scheduling.getVenue().getName() : null,
                scheduling.getEquipments() != null ?
                        scheduling.getEquipments().stream().findFirst().map(Equipment::getEquipmentId).orElse(null)
                        : null,
                scheduling.getUpdateAt(),
                scheduling.getCompany() != null ? scheduling.getCompany().getCnpj() : null,
                true
        );
    }

    public static SchedulingResponseDTO fromWithPrivacy(Scheduling scheduling, UUID loggedCompanyId) {
        boolean isSameCompany = scheduling.getCompany() != null &&
                scheduling.getCompany().getCompanyId().equals(loggedCompanyId);

        if (isSameCompany) {
            return from(scheduling);
        }

        return new SchedulingResponseDTO(
                scheduling.getSchedulingId(),
                "Reservado",
                null,
                scheduling.getStartAt(),
                scheduling.getEndAt(),
                null,
                null,
                null,
                scheduling.getVenue() != null ? scheduling.getVenue().getVenueId() : null,
                scheduling.getVenue() != null ? scheduling.getVenue().getName() : null,
                null,
                null,
                null,
                false
        );
    }
}