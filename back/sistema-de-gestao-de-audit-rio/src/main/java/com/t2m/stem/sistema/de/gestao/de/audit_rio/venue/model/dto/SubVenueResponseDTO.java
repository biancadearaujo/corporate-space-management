package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;

public record SubVenueResponseDTO(
        String name,
        String capacity,
        Venue venue,
        Integer maximumMonths
) {
    public static SubVenueResponseDTO from(SubVenue subVenue) {
        return new SubVenueResponseDTO(
                subVenue.getName(),
                subVenue.getCapacity(),
                subVenue.getVenue(),
                subVenue.getMaximumMonths()
        );
    }
}
