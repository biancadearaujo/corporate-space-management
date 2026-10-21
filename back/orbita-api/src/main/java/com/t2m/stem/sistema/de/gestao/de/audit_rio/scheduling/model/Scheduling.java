package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.Equipment;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.BookingPeriod;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@Entity
public class Scheduling {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID schedulingId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "update_at")
    private LocalDateTime updateAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_period", nullable = true)
    private BookingPeriod bookingPeriod;

    @ManyToOne
    @JoinColumn(name = "id_company", nullable = true)
    private Company company;

    @ManyToOne
    @JoinColumn(name = "id_venue", nullable = true)
    private Venue venue;

    @ManyToOne
    @JoinColumn(name = "sub_auditorium_id")
    private SubVenue subVenue;

    @OneToOne
    @JoinColumn(name = "register_request_id", nullable = false, unique = true)
    private SchedulingRegisterRequest registerRequest;

    @ManyToMany
    @JoinTable(
            name = "scheduling_equipments_link",
            joinColumns = @JoinColumn(name = "scheduling_id"),
            inverseJoinColumns = @JoinColumn(name = "equipment_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Equipment> equipments = new ArrayList<>();
}
