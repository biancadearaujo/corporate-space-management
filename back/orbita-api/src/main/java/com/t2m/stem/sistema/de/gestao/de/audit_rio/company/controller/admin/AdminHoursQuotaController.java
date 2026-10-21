package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.controller.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyQuotaResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyWithQuotaResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.admin.AdminCompanyQuotaService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/admin/company-hours-quota"})
@AllArgsConstructor
public class AdminHoursQuotaController {
    private AdminCompanyQuotaService adminCompanyQuotaService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<CompanyQuotaResponseDTO>> getAllCompaniesQuota(
            @PageableDefault(
                    size = 20,
                    sort = "additionalHoursApproved") Pageable pageable){
        var additionalHoursRequest = adminCompanyQuotaService.getAllCompaniesQuota(pageable);
        return ResponseEntity.ok(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/with-quota")
    public ResponseEntity<List<CompanyWithQuotaResponseDTO>> getAllCompaniesWithQuotaResponseDTO(){
        var HoursRequest = adminCompanyQuotaService.getAllCompaniesWithQuotaResponseDTO();
        return ResponseEntity.ok(HoursRequest);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/{companyQuotaId}"})
    public ResponseEntity<CompanyQuotaResponseDTO> getCompanyQuotaById(
            @PathVariable UUID companyQuotaId) {
        var additionalHoursRequest = adminCompanyQuotaService.getCompanyQuotaById(companyQuotaId);
        return ResponseEntity.ok(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/company/{companyId}"})
    public ResponseEntity<CompanyQuotaResponseDTO> getCompanyQuotaByCompanyId(
            @PathVariable UUID companyId) {
        var additionalHoursRequest = adminCompanyQuotaService.getCompanyQuotaByCompanyId(companyId);
        return ResponseEntity.ok(additionalHoursRequest);
    }
}
