package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.controller.collaborator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.*;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service.collaborator.CollaboratorSchedulingService;
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
@RequestMapping("/collaborator")
@AllArgsConstructor
public class CollaboratorSchedulingController {
    private CollaboratorSchedulingService collaboratorSchedulingService;

    @PreAuthorize("hasRole('COLLABORATOR')")
    @GetMapping({"/scheduling"})
    public ResponseEntity<Page<SchedulingResponseDTO>> getAllScheduling(
            @PageableDefault(
                    size = 20,
                    sort = "name") Pageable pageable){
        var scheduling = collaboratorSchedulingService.getAllScheduling(pageable);
        return ResponseEntity.ok(scheduling);
    }

    @PreAuthorize("hasRole('COLLABORATOR')")
    @GetMapping({"/unified-scheduling"})
    public ResponseEntity<Page<UnifiedSchedulingDTO>> searchAllUnifiedScheduling(
            @PageableDefault(
                    size = 20,
                    sort = "name") Pageable pageable){
        var scheduling = collaboratorSchedulingService.searchAllUnifiedScheduling(pageable);
        return ResponseEntity.ok(scheduling);
    }

    @PreAuthorize("hasRole('COLLABORATOR')")
    @GetMapping({"/scheduling/{schedulingId}"})
    public ResponseEntity<SchedulingResponseDTO> getSchedulingById(@PathVariable UUID schedulingId){
        var scheduling = collaboratorSchedulingService.getSchedulingById(schedulingId);
        return ResponseEntity.ok(scheduling);
    }

    @PreAuthorize("hasRole('COLLABORATOR')")
    @GetMapping({"/scheduling/status/{status}"})
    public ResponseEntity<List<SchedulingRegisterResponseDTO>> getSchedulingByStatus(
            @PathVariable SchedulingRequestStatus status) {
        var scheduling = collaboratorSchedulingService.getSchedulingByStatus(status);
        return ResponseEntity.ok(scheduling);
    }

    @PreAuthorize("hasRole('COLLABORATOR')")
    @PostMapping({"/scheduling"})
    public ResponseEntity<SchedulingRegisterResponseDTO> schedulingRegistrationRequest(@RequestBody SchedulingRegisterRequestDTO schedulingRegisterRequestDTO) {
        var schedulingRegistrationRequest = collaboratorSchedulingService.schedulingRegistrationRequest(schedulingRegisterRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(schedulingRegistrationRequest);
    }

    @PreAuthorize("hasRole('COLLABORATOR')")
    @PutMapping("/scheduling/{schedulingId}")
    public ResponseEntity<SchedulingRegisterResponseDTO> schedulingUpdateRequest(@PathVariable UUID schedulingId,
                                                                        @RequestBody SchedulingUpdateDTO schedulingUpdateDTO) {
        var scheduling = collaboratorSchedulingService.schedulingUpdateRequest(schedulingId, schedulingUpdateDTO);
        return ResponseEntity.ok(scheduling);
    }

    @PreAuthorize("hasRole('COLLABORATOR')")
    @DeleteMapping("/scheduling/{schedulingId}")
    public ResponseEntity<Void> schedulingDeleteRequest(@PathVariable UUID schedulingId) {
        collaboratorSchedulingService.schedulingDeleteRequest(schedulingId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('COLLABORATOR')")
    @DeleteMapping("/scheduling-request/{requestId}")
    public ResponseEntity<Void> deleteRequest(@PathVariable UUID requestId) {
        collaboratorSchedulingService.deletePendingRequest(requestId);
        return ResponseEntity.noContent().build();
    }
}