package com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.controller.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.dto.EquipmentRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.dto.EquipmentResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.dto.EquipmentUpdateDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.service.admin.AdminEquipmentService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin")
@AllArgsConstructor
public class AdminEquipmentController {
    private AdminEquipmentService adminEquipmentService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping({"/equipment"})
    public ResponseEntity<EquipmentResponseDTO> registerEquipment(@Valid @RequestBody EquipmentRequestDTO equipmentDTO) {
        var equipment = adminEquipmentService.createEquipment(equipmentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(equipment);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/equipment"})
    public ResponseEntity<Page<EquipmentResponseDTO>> getAllEquipment(
            @PageableDefault(
                    size = 20,
                    sort = "serialNumber") Pageable pageable){
        var equipment = adminEquipmentService.getAllEquipment(pageable);
        return ResponseEntity.ok(equipment);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/equipment/{equipmentId}"})
    public ResponseEntity<EquipmentResponseDTO> getEquipmentById(@PathVariable UUID equipmentId) {
        var equipment = adminEquipmentService.getEquipmentById(equipmentId);
        return ResponseEntity.ok(equipment);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/equipment/serialNumber/{serialNumber}"})
    public ResponseEntity<EquipmentResponseDTO> getEquipmentBySerialNumber(@PathVariable String serialNumber) {
        var equipment = adminEquipmentService.getEquipmentBySerialNumber(serialNumber);
        return ResponseEntity.ok(equipment);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping({"/equipment/{equipmentId}"})
    public ResponseEntity<EquipmentResponseDTO> updateEquipment(@Valid @PathVariable UUID equipmentId,
                                                               @RequestBody EquipmentUpdateDTO equipmentDTO) {
        var equipment = adminEquipmentService.updateEquipment(equipmentId, equipmentDTO);
        return ResponseEntity.ok(equipment);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping({"/equipment/{equipmentId}"})
    public ResponseEntity<Void> deleteEquipment(@PathVariable UUID equipmentId) {
        adminEquipmentService.deleteEquipment(equipmentId);
        return ResponseEntity.noContent().build();
    }
}
