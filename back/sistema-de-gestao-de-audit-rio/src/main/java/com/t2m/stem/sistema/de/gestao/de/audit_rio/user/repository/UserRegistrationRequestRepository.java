package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.UserRegistrationRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.RequestStatus;
import jakarta.validation.constraints.Email;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRegistrationRequestRepository extends JpaRepository<UserRegistrationRequest, UUID> {
    List<UserRegistrationRequest> findByStatus(RequestStatus status);
    List<UserRegistrationRequest> findByCompanyCompanyId(UUID companyId);
    Page<UserRegistrationRequest> findByCompanyCompanyId(UUID companyId, Pageable pageable);
    boolean existsByStatusAndCompanyCompanyId(RequestStatus status, UUID companyId);
    boolean existsByCompanyCompanyId(UUID companyId);
    List<UserRegistrationRequest> findByStatusAndCompanyCompanyId(RequestStatus requestStatus, UUID companyId);

    Optional<UserRegistrationRequest> findByEmail(@Email String email);
}
