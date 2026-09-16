package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;

import java.time.LocalTime;
import java.util.UUID;

public record SubVenueRequestDTO(
        UUID subVenueId,
        String name,
        String capacity,
        Venue venue,
        Integer maximumMonths
) {
}
