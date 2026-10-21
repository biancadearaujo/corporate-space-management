package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.controller.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdminDashboardStatsDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.admin.AdminDashboardService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/dashboard")
@AllArgsConstructor
public class AdminDashboardController {

    private AdminDashboardService adminDashboardService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsDTO> getStats() {
        return ResponseEntity.ok(adminDashboardService.getAdminStats());
    }
}
