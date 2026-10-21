package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.controller.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyQuotaResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.manager.ManagerCompanyQuotaService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping({"/manager/company-hours-quota"})
@AllArgsConstructor
public class ManagerCompanyQuotaController {
    private ManagerCompanyQuotaService managerCompanyQuotaService;

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/{companyQuotaId}"})
    public ResponseEntity<CompanyQuotaResponseDTO> getCompanyQuotaById(
            @PathVariable UUID companyQuotaId) {
        var additionalHoursRequest = managerCompanyQuotaService.getCompanyQuotaById(companyQuotaId);
        return ResponseEntity.ok(additionalHoursRequest);
    }
}