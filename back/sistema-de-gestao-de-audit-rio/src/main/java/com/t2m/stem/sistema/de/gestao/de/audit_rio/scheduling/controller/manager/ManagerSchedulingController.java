package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.controller.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRegisterRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRegisterResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingUpdateDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service.manager.ManagerSchedulingService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/manager")
@AllArgsConstructor
public class ManagerSchedulingController {
    private ManagerSchedulingService managerSchedulingService;

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/scheduling"})
    public ResponseEntity<Page<SchedulingResponseDTO>> getAllScheduling(
            @PageableDefault(
                    size = 20,
                    sort = "name") Pageable pageable){
        var scheduling = managerSchedulingService.getAllScheduling(pageable);
        return ResponseEntity.ok(scheduling);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/scheduling/request"})
    public ResponseEntity<Page<SchedulingRegisterResponseDTO>> getAllRequestScheduling(
            @PageableDefault(
                    size = 20,
                    sort = "name") Pageable pageable){
        var scheduling = managerSchedulingService.getAllRequestScheduling(pageable);
        return ResponseEntity.ok(scheduling);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/scheduling/{schedulingId}"})
    public ResponseEntity<SchedulingResponseDTO> getSchedulingById(@PathVariable UUID schedulingId){
        var scheduling = managerSchedulingService.getSchedulingById(schedulingId);
        return ResponseEntity.ok(scheduling);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/scheduling/request/{schedulingId}"})
    public ResponseEntity<SchedulingRegisterResponseDTO> getRequestSchedulingById(@PathVariable UUID schedulingId){
        var scheduling = managerSchedulingService.findByRequestSchedulingId(schedulingId);
        return ResponseEntity.ok(scheduling);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/scheduling/status/{status}"})
    public ResponseEntity<List<SchedulingRegisterResponseDTO>> getSchedulingByStatus(
            @PathVariable SchedulingRequestStatus status) {
        var scheduling = managerSchedulingService.getSchedulingByStatus(status);
        return ResponseEntity.ok(scheduling);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/scheduling/status/pending"})
    public ResponseEntity<List<SchedulingRegisterResponseDTO>> getSchedulingByStatusPending() {
        var scheduling = managerSchedulingService.getSchedulingByStatusPending();
        return ResponseEntity.ok(scheduling);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping({"/scheduling"})
    public ResponseEntity<SchedulingRegisterResponseDTO> schedulingRegistrationRequest(
            @RequestBody SchedulingRegisterRequestDTO schedulingRegisterRequestDTO) {
        var schedulingRegistrationRequest = managerSchedulingService
                .managerSchedulingRegistrationRequest(schedulingRegisterRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(schedulingRegistrationRequest);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping({"/scheduling/{schedulingId}"})
    public ResponseEntity<SchedulingRegisterResponseDTO> schedulingUpdate(
            @PathVariable UUID schedulingId,
            @RequestBody SchedulingUpdateDTO schedulingUpdateDTO) {
        var scheduling = managerSchedulingService.schedulingUpdate(schedulingId, schedulingUpdateDTO);
        return ResponseEntity.ok(scheduling);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @DeleteMapping({"/scheduling/{schedulingId}"})
    public ResponseEntity<Void> schedulingDeleteRequest(@PathVariable UUID schedulingId) {
        managerSchedulingService.schedulingDeleteRequest(schedulingId);
        return ResponseEntity.noContent().build();
    }
}