package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Entity(name="opening_hours")
public class OpeningHours {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID openingHoursId;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "opening_time", nullable = false)
    private LocalTime openingTime;

    @Column(name = "closing_time", nullable = false)
    private LocalTime closingTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    public LocalTime getOpeningTime() {
        return openingTime != null ? openingTime : LocalTime.of(8, 0);
    }

    public LocalTime getClosingTime() {
        return closingTime != null ? closingTime : LocalTime.of(17, 0);
    }
}
