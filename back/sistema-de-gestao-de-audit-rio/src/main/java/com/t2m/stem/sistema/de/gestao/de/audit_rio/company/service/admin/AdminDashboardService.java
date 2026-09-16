package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdminAlertDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdminDashboardStatsDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.MonthlyCreationDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.AdditionalHoursRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.AdditionalHoursRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyHoursQuotaRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.MonthlyUsageCompanyHoursRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@AllArgsConstructor
public class AdminDashboardService {

    private CompanyRepository companyRepository;
    private MonthlyUsageCompanyHoursRepository monthlyUsageRepository;
    private CompanyHoursQuotaRepository companyHoursQuotaRepository;
    private AdditionalHoursRequestRepository additionalHoursRequestRepository;
    private UserValidator userValidator;

    public AdminDashboardStatsDTO getAdminStats() {
        userValidator.validateAdminAccess();

        LocalDate currentMonthDate = YearMonth.now().atDay(1);
        Double totalHours = monthlyUsageRepository.sumTotalUsageForMonthAllActiveCompanies(currentMonthDate);
        long totalCompanies = companyRepository.countByDeletedFalse();

        List<AdminAlertDTO> alerts = new ArrayList<>();

        long pendingHoursRequests = additionalHoursRequestRepository.countByStatus(AdditionalHoursRequestStatus.PENDING_ADMIN_REVIEW);
        if (pendingHoursRequests > 0) {
            alerts.add(new AdminAlertDTO(
                    pendingHoursRequests + " solicitações de horas extras pendentes",
                    "red"
            ));
        }

        long companiesNearLimit = companyHoursQuotaRepository.countCompaniesNearLimit();
        if (companiesNearLimit > 0) {
            alerts.add(new AdminAlertDTO(
                    companiesNearLimit + " empresas próximas do limite de horas",
                    "orange"
            ));
        }

        long deletedCompanies = companyRepository.countDeletedCompaniesExcludingAdmin();
        if (deletedCompanies > 0) {
            alerts.add(new AdminAlertDTO(
                    deletedCompanies + " empresas inativas no sistema",
                    "blue"
            ));
        }

        long totalAlertsCount = alerts.size();

        List<MonthlyCreationDTO> monthlyCreations = new ArrayList<>();
        YearMonth currentYearMonth = YearMonth.now();

        for (int i = 5; i >= 0; i--) {
            YearMonth targetMonth = currentYearMonth.minusMonths(i);

            LocalDateTime start = targetMonth.atDay(1).atStartOfDay();
            LocalDateTime end = targetMonth.atEndOfMonth().atTime(23, 59, 59);

            long count = companyRepository.countByCreatedAtBetween(start, end);

            String monthName = targetMonth.getMonth()
                    .getDisplayName(TextStyle.SHORT, new Locale("pt", "BR"))
                    .toUpperCase();

            monthlyCreations.add(new MonthlyCreationDTO(monthName, count));
        }

        return new AdminDashboardStatsDTO(
                totalHours,
                totalCompanies,
                totalAlertsCount,
                alerts,
                monthlyCreations
        );
    }
}