package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.Scheduling;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SchedulingRepository extends JpaRepository<Scheduling, UUID> {
    Optional<Scheduling> findBySchedulingIdAndCompany(UUID schedulingId, Company company);
    Page<Scheduling> findByCreatedByAndCompanyCompanyId(UUID userId, UUID companyId, Pageable pageable);
    Optional<Scheduling> findByCreatedByAndSchedulingIdAndCompany(UUID userId, UUID schedulingId, Company company);
    Page<Scheduling> findAllByCompanyCompanyId(UUID companyId, Pageable pageable);
    Optional<Scheduling> findBySchedulingIdAndCompanyCompanyId(UUID schedulingId, UUID companyId);

    Scheduling findByRegisterRequest(SchedulingRegisterRequest registerRequest);
}