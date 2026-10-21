package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.HoursApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface HoursApprovalHistoryRepository extends JpaRepository<HoursApprovalHistory, UUID> {
}
