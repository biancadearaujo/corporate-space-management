package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;
import java.util.UUID;

@Data
@Entity(name="sub_venues")
public class SubVenue {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID subVenueId;

    @Column(name = "name")
    private String name;

    @Column(name = "capacity")
    private String capacity;

    @Column(name = "maximum_months")
    private Integer maximumMonths;

    @ManyToOne
    @JoinColumn(name = "venue_id")
    private Venue venue;
}
