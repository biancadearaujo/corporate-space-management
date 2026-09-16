package com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, UUID> {
    Optional<Equipment> findBySerialNumber(String serialNumber);
}
