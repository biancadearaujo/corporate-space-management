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
        UUID equipmentsId,
        LocalDateTime updateAt,
        String cnpj
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
                scheduling.getCompany().getCompanyId(),
                scheduling.getVenue().getVenueId(),
                //TODO: Testar aqui para ver se está retornando o ID correto do equipamento.
                scheduling.getEquipments() != null ?
                        scheduling.getEquipments().stream().findFirst().map(Equipment::getEquipmentId).orElse(null)
                        : null,
                scheduling.getUpdateAt(),
                scheduling.getCompany().getCnpj()
        );
    }
}
