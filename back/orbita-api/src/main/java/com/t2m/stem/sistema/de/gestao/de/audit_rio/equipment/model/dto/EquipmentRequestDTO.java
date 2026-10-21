package com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.enums.ConservationStatus;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record EquipmentRequestDTO(
        @NotNull(message = "Serial number cannot be null.")
        String serialNumber,

        @NotNull(message = "Name cannot be null.")
        String name,

        @NotNull(message = "Conservation Status cannot be null.")
        ConservationStatus conservationStatus,

        @NotNull(message = "Available status cannot be null.")
        Boolean available,

        UUID venueId,
        UUID subVenueId
) {
}
