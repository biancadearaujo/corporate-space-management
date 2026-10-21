package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.AdditionalHoursRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.AdditionalHoursRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdditionalHoursRequestRepository extends JpaRepository<AdditionalHoursRequest, UUID> {
    List<AdditionalHoursRequest> findByRequesterId(UUID requesterId);
    List<AdditionalHoursRequest> findByRequesterIdAndCompanyId(UUID requesterId, UUID companyId);
    Page<AdditionalHoursRequest> findByRequesterIdAndCompanyId(UUID requesterId, Pageable pageable, UUID companyId);
    List<AdditionalHoursRequest> findByCompanyId(UUID companyId);
    List<AdditionalHoursRequest> findByStatus(AdditionalHoursRequestStatus status);
    Optional<AdditionalHoursRequest> findByAdditionalHoursRequestIdAndRequesterIdAndCompanyId(UUID additionalHoursRequestId,
                                                                                              UUID RequesterId,
                                                                                              UUID companyId);
    List<AdditionalHoursRequest> findByStatusAndRequesterIdAndCompanyId(AdditionalHoursRequestStatus status,
                                                                        UUID userId, UUID companyId);

    Page<AdditionalHoursRequest> findByCompanyId(UUID companyId, Pageable pageable);

    List<AdditionalHoursRequest> findByStatusAndCompanyId(AdditionalHoursRequestStatus status, UUID companyId);

    Optional<AdditionalHoursRequest> findByAdditionalHoursRequestIdAndCompanyId(UUID additionalHoursRequestId,
                                                                                UUID companyId);

    long countByStatus(AdditionalHoursRequestStatus status);
}
