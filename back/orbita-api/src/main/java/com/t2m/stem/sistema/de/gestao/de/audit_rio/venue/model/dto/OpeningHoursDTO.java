package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.OpeningHours;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record OpeningHoursDTO(
        DayOfWeek dayOfWeek,
        LocalTime openingTime,
        LocalTime closingTime
) {
    public static OpeningHoursDTO from(OpeningHours openingHours) {
        return new OpeningHoursDTO(
                openingHours.getDayOfWeek(),
                openingHours.getOpeningTime(),
                openingHours.getClosingTime()
        );
    }
}
