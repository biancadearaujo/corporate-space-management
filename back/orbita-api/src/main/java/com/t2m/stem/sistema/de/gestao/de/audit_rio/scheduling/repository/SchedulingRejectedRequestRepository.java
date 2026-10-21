package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRejectedRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface SchedulingRejectedRequestRepository extends JpaRepository<SchedulingRejectedRequest, UUID> {
    List<SchedulingRejectedRequest> findByCompanyAndCreatedBy(Company company, UUID createdBy);
}
