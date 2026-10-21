package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.controller;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.CompanyService;
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
@RequestMapping({"/companies"})
@AllArgsConstructor
public class CompanyController {
    private CompanyService companyService;

    @GetMapping
    public ResponseEntity<Page<CompanyResponseDTO>> getAllCompany(
            @PageableDefault(
                    size = 20,
                    sort = "name") Pageable pageable){
        var companies = companyService.getAllCompanies(pageable);
        return ResponseEntity.ok(companies);
    }
}
