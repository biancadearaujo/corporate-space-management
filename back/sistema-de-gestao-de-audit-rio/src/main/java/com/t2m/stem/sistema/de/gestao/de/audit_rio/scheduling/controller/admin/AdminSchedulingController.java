package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.controller.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service.admin.AdminSchedulingService;
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
@RequestMapping("/admin")
@AllArgsConstructor
public class AdminSchedulingController {
    private AdminSchedulingService adminSchedulingService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/scheduling"})
    public ResponseEntity<Page<SchedulingResponseDTO>> getAllScheduling(
            @PageableDefault(
                    size = 20,
                    sort = "name") Pageable pageable){
        var scheduling = adminSchedulingService.getAllScheduling(pageable);
        return ResponseEntity.ok(scheduling);
    }
}