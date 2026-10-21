package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.controller.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRejectedResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service.SchedulingRejectedService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/manager")
@AllArgsConstructor
public class SchedulingRejectedController {
    private SchedulingRejectedService schedulingRejectedService;

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/scheduling-rejected"})
    public ResponseEntity<Page<SchedulingRejectedResponseDTO>> getAllScheduling(
            @PageableDefault(
                    size = 20,
                    sort = "name") Pageable pageable){
        var scheduling = schedulingRejectedService.getAllScheduling(pageable);
        return ResponseEntity.ok(scheduling);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/scheduling-rejected/{schedulingId}"})
    public ResponseEntity<SchedulingRejectedResponseDTO> getSchedulingById(UUID schedulingId) {
        var scheduling = schedulingRejectedService.getSchedulingById(schedulingId);
        return ResponseEntity.ok(scheduling);
    }
}
