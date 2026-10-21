package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;

import java.util.UUID;

public record SubVenueResponseDTO(
        UUID subVenueId,
        String name,
        String capacity,
        Integer maximumMonths
) {
    public static SubVenueResponseDTO from(SubVenue subVenue) {
        return new SubVenueResponseDTO(
                subVenue.getSubVenueId(),
                subVenue.getName(),
                subVenue.getCapacity(),
                subVenue.getMaximumMonths()
        );
    }
}
