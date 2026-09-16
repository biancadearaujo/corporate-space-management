package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.CompanyHoursQuota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyHoursQuotaRepository extends JpaRepository<CompanyHoursQuota, UUID> {
    @Query("SELECT c FROM CompanyHoursQuota c WHERE c.company.companyId = :companyId")
    Optional<CompanyHoursQuota> findByCompanyId(@Param("companyId") UUID companyId);

    Optional<CompanyHoursQuota> findByCompanyHoursQuotaIdAndCompany(UUID companyHoursQuotaId,
                                                                      Company companyQuotaId);

    @Query("""
        SELECT q
        FROM CompanyHoursQuota q
        JOIN FETCH q.company
    """)
    List<CompanyHoursQuota> findAllWithCompany();

    Optional<CompanyHoursQuota> findByCompany_CompanyId(UUID companyId);

    @Query("SELECT COALESCE(SUM(q.consumedHours), 0) FROM CompanyHoursQuota q WHERE q.company.deleted = false")
    Double sumTotalConsumedHours();

    @Query(value = """
        SELECT COUNT(*) FROM company_hours_quota 
        WHERE (consumed_hours / NULLIF(monthly_limit_hours + additional_hours_approved, 0)) >= 0.9
    """, nativeQuery = true)
    long countCompaniesNearLimit();
}