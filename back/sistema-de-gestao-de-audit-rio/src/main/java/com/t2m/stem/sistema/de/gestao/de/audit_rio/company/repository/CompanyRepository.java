package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    @Query("SELECT c FROM companies c WHERE c.name = :name AND c.deleted = false")
    List<Company> findActiveByName(String name);

    @Query("SELECT c FROM companies c WHERE c.deleted = false")
    Page<Company> findAllActive(Pageable pageable);

    @Query("SELECT c FROM companies c WHERE c.companyId = :id AND c.deleted = false")
    Optional<Company> findActiveById(@Param("id") UUID id);

    Optional<Company> findByCnpj(String cnpj);

    @Query(value = "SELECT * FROM companies WHERE deleted = true AND company_id != '58a5bfab-eacd-49e9-b1b3-58f43b954056'", nativeQuery = true)
    Page<Company> findAllDeleted(Pageable pageable);

    @Query(value = "SELECT * FROM companies WHERE company_id = ?1", nativeQuery = true)
    Optional<Company> findByCompanyIdIncludingDeleted(UUID companyId);

    @Modifying
    @Query(value = "UPDATE companies SET deleted = false WHERE company_id = :id", nativeQuery = true)
    void restoreCompanyNative(@Param("id") UUID id);

    long countByDeletedFalse();

    @Query(value = """
        SELECT COUNT(*) 
        FROM companies 
        WHERE deleted = true 
        AND company_id != '58a5bfab-eacd-49e9-b1b3-58f43b954056'
    """, nativeQuery = true)
    long countDeletedCompaniesExcludingAdmin();

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
