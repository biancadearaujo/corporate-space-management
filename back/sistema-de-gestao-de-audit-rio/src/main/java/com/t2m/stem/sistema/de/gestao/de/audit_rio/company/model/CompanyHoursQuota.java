package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
public class CompanyHoursQuota {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID companyHoursQuotaId;
    private double monthlyLimitHours = 20;
    private double maxMonthlyHoursAuditorium = 12;
    private double maxMonthlyHoursMeetingRoom = 12.0;
    private double maxMonthlyHoursCoworking = 12;
    private double consumedHours;

    private double additionalHoursApproved;
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
}