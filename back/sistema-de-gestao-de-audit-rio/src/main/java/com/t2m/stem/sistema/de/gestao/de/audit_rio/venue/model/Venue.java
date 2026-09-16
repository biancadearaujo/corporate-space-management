package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.model.Accessibility;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.Equipment;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.Scheduling;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity(name="venues")
public class Venue {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID venueId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "capacity", nullable = false)
    private String capacity;

    @Column(name = "size", nullable = false)
    private String size;

    @Column(name = "image", nullable = false)
    private String image;

    @Column(name = "parking", nullable = false)
    private Boolean parking;

    @Column(name = "divisible", nullable = false)
    private boolean divisible = false;

    @Column(name = "minimum_hours_to_cancel", nullable = false)
    private Integer minimumHoursToCancel;

    @Column(name = "cancellation_deadline_hours", nullable = false)
    private int cancellationDeadlineHours = 48;

    @Column(name = "maximum_months")
    private int maximumMonths;

    @Enumerated(EnumType.STRING)
    @Column(name = "venue_type", nullable = true)
    private VenueType venueType;

    @ManyToOne
    @JoinColumn(name = "accessibility_id")
    private Accessibility accessibility;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OpeningHours> openingHours = new ArrayList<>();

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubVenue> subVenues = new ArrayList<>();

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL)
    private List<Equipment> equipments = new ArrayList<>();

    @OneToMany(mappedBy = "venue")
    private List<Scheduling> schedulings = new ArrayList<>();

    public void addSubVenue(SubVenue subVenue) {
        subVenues.add(subVenue);
        subVenue.setVenue(this);
    }

    public void addEquipment(Equipment equipment) {
        equipments.add(equipment);
        equipment.setVenue(this);
    }
}