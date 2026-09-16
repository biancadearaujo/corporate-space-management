package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.UserRejectedRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserRejectedRequestRepository extends JpaRepository<UserRejectedRequest, UUID> {
}
