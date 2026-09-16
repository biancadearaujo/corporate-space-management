package com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.Equipment;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.enums.ConservationStatus;

import java.util.UUID;

public record EquipmentSimpleDTO(
        UUID id,
        String name,
        String serialNumber,
        Boolean available,
        ConservationStatus conservationStatus
) {
    public static EquipmentSimpleDTO from(Equipment equipment) {
        return new EquipmentSimpleDTO(
                equipment.getEquipmentId(),
                equipment.getName(),
                equipment.getSerialNumber(),
                equipment.getAvailable(),
                equipment.getConservationStatus()
        );
    }
}
