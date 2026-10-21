package com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.Equipment;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.enums.ConservationStatus;

import java.util.UUID;

public record EquipmentResponseDTO(
        UUID equipmentId,
        String name,
        String serialNumber,
        Boolean available,
        ConservationStatus conservationStatus,
        UUID venueId,
        String venueName,
        UUID subVenueId
) {
    public static EquipmentResponseDTO from(Equipment equipment) {
        return new EquipmentResponseDTO(
                equipment.getEquipmentId(),
                equipment.getName(),
                equipment.getSerialNumber(),
                equipment.getAvailable(),
                equipment.getConservationStatus(),
                equipment.getVenue() != null ? equipment.getVenue().getVenueId() : null,
                equipment.getVenue() != null ? equipment.getVenue().getName() : null,
                equipment.getSubVenue() != null ? equipment.getSubVenue().getSubVenueId() : null
        );
    }
}
