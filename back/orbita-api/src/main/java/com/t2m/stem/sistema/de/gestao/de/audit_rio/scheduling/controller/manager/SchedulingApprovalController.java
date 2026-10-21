package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.controller.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRegisterRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRegisterResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRejectedResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service.manager.SchedulingApprovalService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/manager")
@AllArgsConstructor
public class SchedulingApprovalController {
    private SchedulingApprovalService schedulingApprovalService;

    @GetMapping("/scheduling/pending")
    public ResponseEntity<List<SchedulingRegisterResponseDTO>> getPendingSchedulingRequests() {
        var requests = schedulingApprovalService.getPendingSchedulingRequests();
        return ResponseEntity.ok(requests);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping({"/scheduling/approve/{id}"})
    public ResponseEntity<SchedulingResponseDTO> approveScheduling(@PathVariable UUID id) {
        var scheduling = schedulingApprovalService.approveScheduling(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduling);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping({"/scheduling/reject/{id}"})
    public ResponseEntity<SchedulingRejectedResponseDTO> rejectScheduling(@PathVariable UUID id,
                                                                          @RequestBody SchedulingRegisterRequestDTO schedulingRegisterRequestDTO) {
        var scheduling = schedulingApprovalService.rejectScheduling(id,schedulingRegisterRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduling);
    }
}
