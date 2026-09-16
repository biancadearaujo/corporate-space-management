package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.dto.EquipmentSimpleDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

public record VenueResponseDTO(
        UUID venueId,
        String name,
        String capacity,
        String size,
        String image,
        Boolean parking,
        Integer minimumHoursToCancel,
        VenueType venueType,
        boolean divisible,
        List<OpeningHoursDTO> openingHours,
        List<EquipmentSimpleDTO> equipments
) {
    public static VenueResponseDTO from(Venue venue) {
        return new VenueResponseDTO(
                venue.getVenueId(),
                venue.getName(),
                venue.getCapacity(),
                venue.getSize(),
                venue.getImage(),
                venue.getParking(),
                venue.getMinimumHoursToCancel(),
                venue.getVenueType(),
                venue.isDivisible(),
                venue.getOpeningHours().stream()
                        .map(OpeningHoursDTO::from)
                        .toList(),
                venue.getEquipments() != null ?
                        venue.getEquipments().stream()
                                .map(EquipmentSimpleDTO::from)
                                .toList() :
                        Collections.emptyList()
        );
    }
}
