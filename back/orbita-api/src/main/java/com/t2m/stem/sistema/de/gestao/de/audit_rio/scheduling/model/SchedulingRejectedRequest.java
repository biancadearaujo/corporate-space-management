package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
public class SchedulingRejectedRequest {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID schedulingRejectedRequestId;

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

    @ManyToOne
    @JoinColumn(name = "id_company", nullable = true)
    private Company company;

    @ManyToOne
    @JoinColumn(name = "id_venue", nullable = true)
    private Venue venue;

    @ManyToOne
    @JoinColumn(name = "sub_auditorium_id")
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

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;
}
