package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.CompanyHoursQuotaService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.MonthlyUsageCompanyHoursService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.factory.ManagerSchedulingFactory;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRegisterRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.validator.ManagerSchedulingValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.validator.SchedulingValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.service.VenueService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class AdminSchedulingService {
    private UserValidator userValidator;
    private VenueService venueService;
    private ManagerSchedulingValidator managerSchedulingValidator;
    private ManagerSchedulingFactory managerSchedulingFactory;
    private SchedulingRegisterRequestRepository schedulingRegisterRequestRepository;
    private SchedulingRepository schedulingRepository;
    private SchedulingValidator schedulingValidator;
    private CompanyHoursQuotaService companyHoursQuotaService;
    private MonthlyUsageCompanyHoursService monthlyUsageCompanyHoursService;

    public Page<SchedulingResponseDTO> getAllScheduling(Pageable pageable) {
        userValidator.validateAdminAccess();

        return schedulingRepository.findAll(pageable)
                .map(SchedulingResponseDTO::from);
    }
}
