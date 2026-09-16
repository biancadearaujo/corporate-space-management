package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.CompanyHoursQuota;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.MonthlyUsageCompanyHours;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyHoursQuotaRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.MonthlyUsageCompanyHoursRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.UUID;

@Service
@AllArgsConstructor
public class MonthlyUsageCompanyHoursService {
    private MonthlyUsageCompanyHoursRepository usageRepository;
    private CompanyRepository companyRepository;
    private MonthlyUsageCompanyHoursRepository monthlyUsageCompanyHoursRepository;
    private CompanyHoursQuotaRepository companyHoursQuotaRepository;

    public void addAdditionalHours(Company company, VenueType venueType, double hoursToAdd, LocalDateTime referenceDate) {
        if (hoursToAdd <= 0) {
            throw new IllegalArgumentException("Used hours must be greater than zero");
        }

        YearMonth currentMonth = YearMonth.from(referenceDate);

        MonthlyUsageCompanyHours usage = usageRepository
                .findByCompany_CompanyIdAndUsageMonthAndVenueType(company.getCompanyId(), currentMonth, venueType)
                .orElseGet(() -> createNewUsage(company, venueType, currentMonth));

        usage.setUsedHours(usage.getUsedHours() + hoursToAdd);
        usage.setUpdatedAt(LocalDateTime.now());

        usageRepository.save(usage);
    }

    public void releaseUsedHours(Company company, VenueType venueType, double hoursToRelease, LocalDateTime referenceDate) {
        if (hoursToRelease <= 0) {
            throw new IllegalArgumentException("Hours to release must be greater than zero");
        }

        YearMonth currentMonth = YearMonth.from(referenceDate);

        MonthlyUsageCompanyHours usage = usageRepository
                .findByCompany_CompanyIdAndUsageMonthAndVenueType(company.getCompanyId(), currentMonth, venueType)
                .orElseThrow(() -> new RuntimeException("Usage not found for company in the given month"));

        double result = usage.getUsedHours() - hoursToRelease;
        usage.setUsedHours(Math.max(result, 0));
        usage.setUpdatedAt(LocalDateTime.now());

        usageRepository.save(usage);
    }

    private MonthlyUsageCompanyHours createNewUsage(Company company, VenueType venueType, YearMonth month) {
        MonthlyUsageCompanyHours usage = new MonthlyUsageCompanyHours();
        usage.setCompany(company);
        usage.setVenueType(venueType);
        usage.setUsageMonth(month);
        usage.setUsedHours(0);
        usage.setUpdatedAt(LocalDateTime.now());
        return usage;
    }

    public double getUsedHoursByCompanyAndMonth(UUID companyId, YearMonth month) {
        return usageRepository.findByCompany_CompanyIdAndUsageMonth(companyId, month)
                .map(MonthlyUsageCompanyHours::getUsedHours)
                .orElse(0.0);
    }

    public double calculateHours(LocalDateTime start, LocalDateTime end, VenueType venueType) {
        if (venueType == VenueType.AUDITORIUM) {
            throw new IllegalStateException("Booking period must be defined for auditorium");
        }
        Duration duration = Duration.between(start, end);
        return duration.toMinutes() / 60.0;
    }

    public void releaseCompanyHours(SchedulingRegisterRequest request) {
        double durationHours = calculateHours(
                request.getStartAt(),
                request.getEndAt(),
                request.getVenue().getVenueType()
        );

        releaseUsedHours(
                request.getCompany(),
                request.getVenue().getVenueType(),
                durationHours,
                request.getStartAt()
        );
    }

    @Transactional
    public void saveOrUpdateMonthlyUsage(UUID companyId, LocalDateTime date, double addedHours, VenueType venueType) {
        YearMonth yearMonth = YearMonth.from(date);

        MonthlyUsageCompanyHours usage = usageRepository
                .findByCompany_CompanyIdAndUsageMonthAndVenueType(companyId, yearMonth, venueType)
                .orElseGet(() -> {
                    Company company = companyRepository.findById(companyId)
                            .orElseThrow(() -> new NotFoundException("Company not found"));

                    MonthlyUsageCompanyHours newUsage = new MonthlyUsageCompanyHours();
                    newUsage.setCompany(company);
                    newUsage.setUsageMonth(yearMonth);
                    newUsage.setVenueType(venueType);
                    newUsage.setUsedHours(0.0);
                    return newUsage;
                });

        usage.setUsedHours(usage.getUsedHours() + addedHours);
        usage.setUpdatedAt(LocalDateTime.now());

        monthlyUsageCompanyHoursRepository.save(usage);
    }

    @Transactional
    public void saveOrUpdateMonthlyUsageRequest(UUID companyId, LocalDateTime date, VenueType venueType, double addedHours) {
        YearMonth yearMonth = YearMonth.from(date);

        MonthlyUsageCompanyHours usage = usageRepository
                .findByCompany_CompanyIdAndUsageMonthAndVenueType(companyId, yearMonth, venueType)
                .orElseGet(() -> {
                    Company company = companyRepository.findById(companyId)
                            .orElseThrow(() -> new NotFoundException("Company not found"));

                    MonthlyUsageCompanyHours newUsage = new MonthlyUsageCompanyHours();
                    newUsage.setCompany(company);
                    newUsage.setUsageMonth(yearMonth);
                    newUsage.setVenueType(venueType);
                    newUsage.setUsedHours(0.0);
                    return newUsage;
                });

        double updatedUsedHours = usage.getUsedHours() + addedHours;
        if (updatedUsedHours < 0) {
            updatedUsedHours = 0.0;
        }

        usage.setUsedHours(updatedUsedHours);
        usage.setUpdatedAt(LocalDateTime.now());
        usageRepository.save(usage);

        CompanyHoursQuota quota = companyHoursQuotaRepository
                .findByCompany_CompanyId(companyId)
                .orElseThrow(() -> new NotFoundException("CompanyHoursQuota not found"));

        double newConsumed = quota.getConsumedHours() + addedHours;
        if (newConsumed < 0) {
            newConsumed = 0.0;
        }

        quota.setConsumedHours(newConsumed);
        companyHoursQuotaRepository.save(quota);
    }
}