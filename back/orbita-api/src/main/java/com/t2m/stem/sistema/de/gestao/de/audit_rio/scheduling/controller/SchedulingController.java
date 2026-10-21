package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.controller;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service.SchedulingService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/scheduling")
@AllArgsConstructor
public class SchedulingController {
    private SchedulingService schedulingService;

    @PreAuthorize("hasRole('COLLABORATOR') or hasRole('MANAGER')")
    @GetMapping
    public ResponseEntity<Page<SchedulingResponseDTO>> getAllScheduling(
            @PageableDefault(
                    size = 20,
                    sort = "name") Pageable pageable){
        var scheduling = schedulingService.getAllScheduling(pageable);
        return ResponseEntity.ok(scheduling);
    }
}
