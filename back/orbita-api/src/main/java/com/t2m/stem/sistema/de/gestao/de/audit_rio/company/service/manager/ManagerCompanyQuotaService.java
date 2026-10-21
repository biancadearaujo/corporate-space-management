package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyQuotaResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyHoursQuotaRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class ManagerCompanyQuotaService {
    private CompanyHoursQuotaRepository companyHoursQuotaRepository;
    private UserValidator userValidator;

    public CompanyQuotaResponseDTO getCompanyQuotaById(UUID companyQuotaId){
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        Company company = currentUser.getCompany();

        return companyHoursQuotaRepository.findByCompanyHoursQuotaIdAndCompany(companyQuotaId, company)
                .map(CompanyQuotaResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Company Hours Quota not found"));
    }
}