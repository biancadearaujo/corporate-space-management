package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class CompanyService {
    private CompanyRepository companyRepository;

    public Page<CompanyResponseDTO> getAllCompanies(Pageable pageable) {
        return companyRepository.findAllActive(pageable)
                .map(CompanyResponseDTO::from);
    }
}
