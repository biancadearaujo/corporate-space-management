package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.*;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class SchedulingService {
    private SchedulingRepository schedulingRepository;
    private UserValidator userValidator;

    public Page<SchedulingResponseDTO> getAllScheduling(Pageable pageable) {
        User currentUser = userValidator.getAuthenticatedUser();
        UUID myCompanyId = currentUser.getCompany().getCompanyId();

        return schedulingRepository.findAll(pageable)
                .map(scheduling -> SchedulingResponseDTO.fromWithPrivacy(scheduling, myCompanyId));
    }

}