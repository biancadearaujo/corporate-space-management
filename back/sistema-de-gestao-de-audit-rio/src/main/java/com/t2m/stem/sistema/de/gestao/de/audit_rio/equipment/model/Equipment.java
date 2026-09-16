package com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.enums.ConservationStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.Scheduling;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRejectedRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity(name="equipments")
public class Equipment {

    @Id
    @GeneratedValue(generator = "UUID")
    private UUID equipmentId;

    @Column(name = "serial_numbers", nullable = false, unique = true)
    private String serialNumber;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "available", nullable = false)
    private Boolean available;

    @Enumerated(EnumType.STRING)
    @Column(name = "conservation_status", nullable = false)
    private ConservationStatus conservationStatus;

    @ManyToOne
    @JoinColumn(name = "id_scheduling_register_request")
    private SchedulingRegisterRequest schedulingRegisterRequest;

    @ManyToOne
    @JoinColumn(name = "id_scheduling_rejected_request")
    private SchedulingRejectedRequest schedulingRejectedRequest;

    @ManyToOne
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @ManyToOne
    @JoinColumn(name = "sub_venue_id")
    private SubVenue subVenue;

    @ManyToMany(mappedBy = "equipments")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Scheduling> schedulings = new ArrayList<>();
}
