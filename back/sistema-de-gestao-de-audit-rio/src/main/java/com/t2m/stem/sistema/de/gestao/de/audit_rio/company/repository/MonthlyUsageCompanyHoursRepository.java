package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.MonthlyUsageCompanyHours;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MonthlyUsageCompanyHoursRepository extends JpaRepository<MonthlyUsageCompanyHours, UUID> {
    Optional<MonthlyUsageCompanyHours> findByCompany_CompanyIdAndUsageMonth(UUID companyId, YearMonth month);
    Optional<MonthlyUsageCompanyHours> findByCompany_CompanyIdAndUsageMonthAndVenueType(UUID companyId,
                                                                                        YearMonth yearMonth,
                                                                                        VenueType venueType);

    @Query("SELECT COALESCE(SUM(much.usedHours), 0.0) " +
            "FROM MonthlyUsageCompanyHours much " +
            "WHERE much.company.companyId = :companyId " +
            "AND much.usageMonth = :usageMonth")
    Double getTotalUsedHoursInMonth(@Param("companyId") UUID companyId, @Param("usageMonth") YearMonth usageMonth);

    @Query(value = """
        SELECT * FROM monthly_usage_company_hours m 
        WHERE m.company_id = :companyId 
        AND m.usage_month BETWEEN :start AND :end
        """, nativeQuery = true)
    List<MonthlyUsageCompanyHours> findByCompanyIdAndUsageMonthBetween(
            @Param("companyId") UUID companyId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    @Query(value = """
        SELECT COALESCE(SUM(used_hours), 0) 
        FROM monthly_usage_company_hours 
        WHERE company_id = :companyId 
        AND usage_month = :monthDate
        """, nativeQuery = true)
    Double sumUsedHoursByCompanyAndMonth(
            @Param("companyId") UUID companyId,
            @Param("monthDate") LocalDate monthDate
    );

    @Query(value = """
        SELECT COALESCE(SUM(m.used_hours), 0) 
        FROM monthly_usage_company_hours m 
        INNER JOIN companies c ON m.company_id = c.company_id 
        WHERE m.usage_month = :date 
        AND c.deleted = false
        """, nativeQuery = true)
    Double sumTotalUsageForMonthAllActiveCompanies(@Param("date") LocalDate date);
}