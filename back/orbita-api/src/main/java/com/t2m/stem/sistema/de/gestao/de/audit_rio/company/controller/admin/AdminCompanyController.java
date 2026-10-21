package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.controller.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyWithQuotaRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.admin.AdminCompanyService;
import jakarta.validation.Valid;
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
@RequestMapping({"/admin"})
@AllArgsConstructor
public class AdminCompanyController {
    private AdminCompanyService adminCompanyService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping({"/company"})
    public ResponseEntity<CompanyResponseDTO> createCompany(@Valid @RequestBody CompanyWithQuotaRequestDTO requestDTO) {
        var company = adminCompanyService.createCompany(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(company);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/company"})
    public ResponseEntity<Page<CompanyResponseDTO>> getAllCompany(
            @PageableDefault(
                    size = 20,
                    sort = "name") Pageable pageable){
        var companies = adminCompanyService.getAllCompanies(pageable);
        return ResponseEntity.ok(companies);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/company/deleted"})
    public ResponseEntity<Page<CompanyResponseDTO>> getDeletedCompanies(
            @PageableDefault(size = 20, sort = "name") Pageable pageable){
        var companies = adminCompanyService.getAllDeletedCompanies(pageable);
        return ResponseEntity.ok(companies);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/company/{companyId}"})
    public ResponseEntity<CompanyResponseDTO> getCompanyById(@PathVariable UUID companyId) {
        var company = adminCompanyService.getCompanyById(companyId);
        return ResponseEntity.ok(company);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/company/name/{name}"})
    public ResponseEntity<List<CompanyResponseDTO>> getCompanyByName(@PathVariable String name) {
        var company = adminCompanyService.getCompanyByName(name);
        return ResponseEntity.ok(company);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/company/{companyId}")
    public ResponseEntity<CompanyResponseDTO> updateCompany(
            @PathVariable UUID companyId,
            @Valid @RequestBody CompanyRequestDTO companyDTO
    ) {
        var company = adminCompanyService.updateCompany(companyId, companyDTO);
        return ResponseEntity.ok(company);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping({"/company/{companyId}"})
    public ResponseEntity<Void> deleteCompany(@PathVariable UUID companyId) {
        adminCompanyService.deleteCompany(companyId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping({"/company/{companyId}/restore"})
    public ResponseEntity<Void> restoreCompany(@PathVariable UUID companyId) {
        adminCompanyService.restoreCompany(companyId);
        return ResponseEntity.noContent().build();
    }
}