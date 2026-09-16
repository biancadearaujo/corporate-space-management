package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.CompanyHoursQuota;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.MonthlyUsageCompanyHours;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.CompanyWithQuotaRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyHoursQuotaRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.MonthlyUsageCompanyHoursRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AdminCompanyService {
    private CompanyRepository companyRepository;
    private CompanyHoursQuotaRepository companyHoursQuotaRepository;
    private UserValidator userValidator;
    private MonthlyUsageCompanyHoursRepository monthlyUsageCompanyHoursRepository;

    public Page<CompanyResponseDTO> getAllCompanies(Pageable pageable) {
        userValidator.validateAdminAccess();
      
        return companyRepository.findAllActive(pageable)
                .map(CompanyResponseDTO::from);
    }

    public CompanyResponseDTO getCompanyById(UUID companyId){
        userValidator.validateAdminAccess();

        return companyRepository.findActiveById(companyId)
                .map(CompanyResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Company not found"));
    }

    public List<CompanyResponseDTO> getCompanyByName(String name){
        userValidator.validateAdminAccess();

        List<Company> companies = companyRepository.findActiveByName(name);

        return companies.stream()
                .map(CompanyResponseDTO::from)
                .toList();
    }

    public Page<CompanyResponseDTO> getAllDeletedCompanies(Pageable pageable) {
        userValidator.validateAdminAccess();
        return companyRepository.findAllDeleted(pageable)
                .map(CompanyResponseDTO::from);
    }

    @Transactional
    public CompanyResponseDTO createCompany(CompanyWithQuotaRequestDTO requestDTO) {
        userValidator.validateAdminAccess();

        Company company = new Company();
        company.setName(requestDTO.name());
        company.setEmail(requestDTO.email());
        company.setCnpj(requestDTO.cnpj());
        company = companyRepository.save(company);

        CompanyHoursQuota quota = new CompanyHoursQuota();
        quota.setCompany(company);
        quota.setMonthlyLimitHours(requestDTO.monthlyLimitHours());
        quota.setAdditionalHoursApproved(requestDTO.additionalHoursApproved());
        companyHoursQuotaRepository.save(quota);

        createMonthlyUsagesHours(company);

        return CompanyResponseDTO.from(company);
    }

    @Transactional
    public CompanyResponseDTO updateCompany(UUID companyId, CompanyRequestDTO companyDTO) {
        userValidator.validateAdminAccess();

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new NotFoundException("Company not found"));

        if (companyDTO.name() != null) {
            company.setName(companyDTO.name());
        }

        if (companyDTO.email() != null) {
            company.setEmail(companyDTO.email());
        }

        if (companyDTO.cnpj() != null) {
            company.setCnpj(companyDTO.cnpj());
        }

        Company updated = companyRepository.save(company);

        return CompanyResponseDTO.from(updated);
    }

    @Transactional
    public void deleteCompany(UUID companyId){
        userValidator.validateAdminAccess();

        companyRepository.findById(companyId)
                .orElseThrow(() -> new NotFoundException("Company not found"));

        companyRepository.deleteById(companyId);
    }

    @Transactional
    public void restoreCompany(UUID companyId) {
        userValidator.validateAdminAccess();

        companyRepository.findByCompanyIdIncludingDeleted(companyId)
                .orElseThrow(() -> new NotFoundException("Company not found"));

        companyRepository.restoreCompanyNative(companyId);
    }

    private void createMonthlyUsagesHours(Company company) {
        YearMonth currentMonth = YearMonth.now();

        for (VenueType venueType : VenueType.values()) {
            MonthlyUsageCompanyHours monthlyUsage = new MonthlyUsageCompanyHours();
            monthlyUsage.setCompany(company);
            monthlyUsage.setVenueType(venueType);
            monthlyUsage.setUsageMonth(currentMonth);
            monthlyUsage.setUsedHours(0.0);
            monthlyUsage.setUpdatedAt(LocalDateTime.now());

            monthlyUsageCompanyHoursRepository.save(monthlyUsage);
        }
    }
}