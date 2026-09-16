package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record VenueRequestDTO(
        @NotNull(message = "Name cannot be null.")
        String name,

        @NotNull(message = "Capacity cannot be null.")
        String capacity,

        @NotNull(message = "Size cannot be null.")
        String size,

        @NotNull(message = "Image cannot be null.")
        String image,

        @NotNull(message = "Parking cannot be null.")
        Boolean parking,

        @NotNull(message = "Accessibility ID cannot be null.")
        UUID accessibilityId,

        @NotNull(message = "Venue type cannot be null.")
        VenueType venueType,

        @NotNull(message = "Maximum months cannot be null.")
        int maximumMonths,

        boolean divisible,

        List<SubVenueRequestDTO> subVenues,

        @NotNull(message = "Minimum hours to cancel time cannot be null.")
        Integer minimumHoursToCancel,

        List<OpeningHoursDTO> openingHours
) {
}
