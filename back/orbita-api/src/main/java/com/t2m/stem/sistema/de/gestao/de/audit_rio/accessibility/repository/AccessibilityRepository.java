package com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.model.Accessibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AccessibilityRepository extends JpaRepository<Accessibility, UUID> {
}
