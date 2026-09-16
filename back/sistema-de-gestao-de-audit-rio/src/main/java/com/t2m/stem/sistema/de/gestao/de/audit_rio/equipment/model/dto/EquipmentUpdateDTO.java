package com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.enums.ConservationStatus;

import java.util.UUID;

public record EquipmentUpdateDTO(
        String name,
        ConservationStatus conservationStatus,
        Boolean available,
        UUID venueId
) {
}
