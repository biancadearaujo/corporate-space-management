package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.utils.converters.YearMonthDateAttributeConverter;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.UUID;

@Data
@Entity
@Table(
        name = "monthly_usage_company_hours",
        uniqueConstraints = @UniqueConstraint(columnNames = {"company_id", "usage_month", "venue_type"})
)
public class MonthlyUsageCompanyHours {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID monthlyUsageCompanyHoursId;

    @Column(columnDefinition = "DATE")
    @Convert(converter = YearMonthDateAttributeConverter.class)
    private YearMonth usageMonth;

    private double usedHours;

    @Enumerated(EnumType.STRING)
    private VenueType venueType;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private LocalDateTime updatedAt;
}