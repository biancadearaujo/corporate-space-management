package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.CompanyHoursQuota;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyHoursQuotaRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.MonthlyUsageCompanyHoursRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CompanyHoursQuotaService {
    private CompanyHoursQuotaRepository companyHoursQuotaRepository;
    private MonthlyUsageCompanyHoursRepository monthlyUsageCompanyHoursRepository;

    public void addAdditionalHours(UUID companyId, double hours) {
        if (hours <= 0) {
            throw new IllegalArgumentException("Additional hours must be greater than zero");
        }

        CompanyHoursQuota quota = companyHoursQuotaRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));

        quota.setAdditionalHoursApproved(quota.getAdditionalHoursApproved() + hours);
        quota.setUpdatedAt(LocalDateTime.now());

        companyHoursQuotaRepository.save(quota);
    }

    public void updateConsumedHoursForCurrentMonth(Company company) {
        YearMonth currentMonth = YearMonth.now();

        double totalUsed = monthlyUsageCompanyHoursRepository
                .getTotalUsedHoursInMonth(company.getCompanyId(), currentMonth);

        CompanyHoursQuota quota = companyHoursQuotaRepository.findByCompanyId(company.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Quota not found"));

        quota.setConsumedHours(totalUsed);
        quota.setUpdatedAt(LocalDateTime.now());

        companyHoursQuotaRepository.save(quota);
    }
}