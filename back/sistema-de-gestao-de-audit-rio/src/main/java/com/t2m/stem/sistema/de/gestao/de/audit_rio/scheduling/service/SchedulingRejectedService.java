package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRejectedResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRejectedRequestRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class SchedulingRejectedService {
    private SchedulingRejectedRequestRepository schedulingRejectedRequestRepository;

    public Page<SchedulingRejectedResponseDTO> getAllScheduling(Pageable pageable) {
        return schedulingRejectedRequestRepository.findAll(pageable)
                .map(SchedulingRejectedResponseDTO::from);
    }

    public SchedulingRejectedResponseDTO getSchedulingById(UUID schedulingId) {
        return schedulingRejectedRequestRepository.findById(schedulingId)
                .map(SchedulingRejectedResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Scheduling not found"));
    }
}
