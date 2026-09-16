package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyQuotaResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyWithQuotaResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyHoursQuotaRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AdminCompanyQuotaService {
    private CompanyHoursQuotaRepository companyHoursQuotaRepository;
    private UserValidator userValidator;

    public Page<CompanyQuotaResponseDTO> getAllCompaniesQuota(Pageable pageable) {
        userValidator.validateAdminAccess();

        return companyHoursQuotaRepository.findAll(pageable)
                .map(CompanyQuotaResponseDTO::from);
    }

    public List<CompanyWithQuotaResponseDTO> getAllCompaniesWithQuotaResponseDTO() {
        userValidator.validateAdminAccess();

        return companyHoursQuotaRepository.findAllWithCompany()
                .stream()
                .map(CompanyWithQuotaResponseDTO::from)
                .toList();
    }

    public CompanyQuotaResponseDTO getCompanyQuotaById(UUID companyQuotaId){
        userValidator.validateAdminAccess();

        return companyHoursQuotaRepository.findById(companyQuotaId)
                .map(CompanyQuotaResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Company Hours Quota not found"));
    }

    public CompanyQuotaResponseDTO getCompanyQuotaByCompanyId(UUID companyId){
        userValidator.validateAdminAccess();

        return companyHoursQuotaRepository.findByCompanyId(companyId)
                .map(CompanyQuotaResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Company Hours Quota not found"));
    }
}