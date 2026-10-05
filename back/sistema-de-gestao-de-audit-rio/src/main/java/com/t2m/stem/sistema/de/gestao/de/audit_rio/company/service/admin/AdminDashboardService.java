package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdminAlertDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdminDashboardStatsDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.MonthlyCreationDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.AdditionalHoursRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.AdditionalHoursRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyHoursQuotaRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.MonthlyUsageCompanyHoursRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRepository;
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
    private SchedulingRepository schedulingRepository;

    public AdminDashboardStatsDTO getAdminStats() {
        userValidator.validateAdminAccess();

        LocalDate currentMonthDate = YearMonth.now().atDay(1);

        YearMonth currentYearMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentYearMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentYearMonth.atEndOfMonth().atTime(23, 59, 59);

        Double totalHours = schedulingRepository.sumApprovedHoursInMonth(startOfMonth, endOfMonth);
        if (totalHours == null) totalHours = 0.0;

        long totalCompanies = companyRepository.countByDeletedFalse();

        long activeReservations = schedulingRepository.countActiveReservationsInMonth(
                startOfMonth,
                endOfMonth
        );

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

        List<MonthlyCreationDTO> monthlyHistory = new ArrayList<>();
        YearMonth currentYearMonthh = YearMonth.now();

        for (int i = 5; i >= 0; i--) {
            YearMonth targetMonth = currentYearMonthh.minusMonths(i);

            LocalDateTime start = targetMonth.atDay(1).atStartOfDay();
            LocalDateTime end = targetMonth.atEndOfMonth().atTime(23, 59, 59);

            Double monthHours = schedulingRepository.sumApprovedHoursInMonth(start, end);
            long hoursAsLong = (monthHours != null) ? Math.round(monthHours) : 0L;

            String monthName = targetMonth.getMonth()
                    .getDisplayName(TextStyle.SHORT, new Locale("pt", "BR"))
                    .toUpperCase();

            monthlyHistory.add(new MonthlyCreationDTO(monthName, hoursAsLong));
        }

        return new AdminDashboardStatsDTO(
                totalHours,
                activeReservations,
                totalCompanies,
                totalAlertsCount,
                alerts,
                monthlyHistory
        );
    }
}