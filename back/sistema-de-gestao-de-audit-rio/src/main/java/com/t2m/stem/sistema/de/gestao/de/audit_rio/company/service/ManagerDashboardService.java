package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.CompanyHoursQuota;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.MonthlyUsageCompanyHours;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.DashboardStatsDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.MonthlyUsageDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyHoursQuotaRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.MonthlyUsageCompanyHoursRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ManagerDashboardService {
    private CompanyHoursQuotaRepository companyHoursQuotaRepository;
    private MonthlyUsageCompanyHoursRepository monthlyUsageRepository;
    private UserValidator userValidator;

    public DashboardStatsDTO getDashboardStats() {
        userValidator.validateManagerAccess();
        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        CompanyHoursQuota quota = companyHoursQuotaRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new NotFoundException("Quota not found."));

        YearMonth currentMonth = YearMonth.now();
        LocalDate firstDayOfCurrentMonth = currentMonth.atDay(1);

        double consumedReal = monthlyUsageRepository.sumUsedHoursByCompanyAndMonth(companyId, firstDayOfCurrentMonth);

        double totalLimit = quota.getMonthlyLimitHours() + quota.getAdditionalHoursApproved();

        double available = Math.max(0, totalLimit - consumedReal);
        double percentage = (totalLimit > 0) ? (consumedReal / totalLimit) * 100 : 0;

        YearMonth oneYearAgo = currentMonth.minusMonths(11);
        LocalDate startDate = oneYearAgo.atDay(1);
        LocalDate endDate = currentMonth.atEndOfMonth();

        List<MonthlyUsageCompanyHours> history = monthlyUsageRepository
                .findByCompanyIdAndUsageMonthBetween(companyId, startDate, endDate);

        Map<YearMonth, Double> hoursPerMonth = history.stream()
                .collect(Collectors.groupingBy(
                        MonthlyUsageCompanyHours::getUsageMonth,
                        Collectors.summingDouble(MonthlyUsageCompanyHours::getUsedHours)
                ));

        List<MonthlyUsageDTO> monthlyHistory = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            YearMonth monthIter = currentMonth.minusMonths(i);
            double hours = hoursPerMonth.getOrDefault(monthIter, 0.0);
            String monthName = monthIter.getMonth()
                    .getDisplayName(TextStyle.SHORT, new Locale("pt", "BR"))
                    .toUpperCase();
            monthlyHistory.add(new MonthlyUsageDTO(monthName, hours));
        }

        return new DashboardStatsDTO(
                totalLimit,
                consumedReal,
                available,
                percentage,
                monthlyHistory
        );
    }
}
