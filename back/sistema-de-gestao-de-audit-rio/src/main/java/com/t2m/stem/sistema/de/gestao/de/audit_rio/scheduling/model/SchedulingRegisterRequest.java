package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.Equipment;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.BookingPeriod;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity
public class SchedulingRegisterRequest {
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

    @ManyToOne
    @JoinColumn(name = "id_company", nullable = true)
    private Company company;

    @ManyToOne
    @JoinColumn(name = "id_venue", nullable = true)
    private Venue venue;

    @ManyToOne
    @JoinColumn(name = "sub_venue_id")
    private SubVenue subVenue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private SchedulingRequestStatus status;

    @Column(name = "decided_by", nullable = true)
    private UUID decidedBy;

    @Column(name = "decided_at", nullable = true)
    private LocalDateTime decidedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_period", nullable = true)
    private BookingPeriod bookingPeriod;

    @OneToOne(mappedBy = "registerRequest")
    private Scheduling scheduling;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.status = SchedulingRequestStatus.PENDING;
    }

    @ManyToMany
    @JoinTable(
            name = "request_equipments_link",
            joinColumns = @JoinColumn(name = "request_id"),
            inverseJoinColumns = @JoinColumn(name = "equipment_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Equipment> equipments = new ArrayList<>();
}