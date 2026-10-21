package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.controller.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.DashboardStatsDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.ManagerDashboardService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/manager/dashboard"})
@AllArgsConstructor
public class ManagerDashboardController {
    private ManagerDashboardService managerDashboardService;

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(managerDashboardService.getDashboardStats());
    }
}
