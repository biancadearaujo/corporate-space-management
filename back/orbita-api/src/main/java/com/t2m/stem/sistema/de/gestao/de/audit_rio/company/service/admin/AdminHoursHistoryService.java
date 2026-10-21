package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.HoursApprovalResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.HoursApprovalHistoryRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class AdminHoursHistoryService {
    private HoursApprovalHistoryRepository hoursApprovalHistoryRepository;
    private UserValidator userValidator;

    public Page<HoursApprovalResponseDTO> getAllHoursHistory(Pageable pageable){
        userValidator.validateAdminAccess();

        return hoursApprovalHistoryRepository.findAll(pageable)
                .map(HoursApprovalResponseDTO::from);
    }

    public HoursApprovalResponseDTO getHoursHistoryById(UUID hoursApprovalId){
        userValidator.validateAdminAccess();

        return hoursApprovalHistoryRepository.findById(hoursApprovalId)
                .map(HoursApprovalResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Hours Approval History not found."));
    }
}
