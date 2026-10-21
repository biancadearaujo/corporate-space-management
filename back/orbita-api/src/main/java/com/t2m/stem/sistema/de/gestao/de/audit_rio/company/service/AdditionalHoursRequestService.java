package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.AdditionalHoursRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.AdditionalHoursRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;
@Service
@AllArgsConstructor
public class AdditionalHoursRequestService {
    private AdditionalHoursRequestRepository additionalHoursRequestRepository;

    public AdditionalHoursRequest findById(UUID additionalHoursRequestId) {
        return additionalHoursRequestRepository.findById(additionalHoursRequestId)
                .orElseThrow(() -> new NotFoundException("Additional Hours Request not found"));
    }
}
