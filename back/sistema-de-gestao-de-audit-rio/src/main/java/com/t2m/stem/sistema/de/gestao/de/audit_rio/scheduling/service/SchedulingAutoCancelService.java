package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRegisterRequestRepository;
import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class SchedulingAutoCancelService {
    private final SchedulingRegisterRequestRepository schedulingRepository;
    @Scheduled(fixedRate = 60 * 60 * 1000)//every hour
    @Transactional
    public void cancelExpiredPending() {
        LocalDateTime now = LocalDateTime.now();
        List<SchedulingRegisterRequest> pending = schedulingRepository.findByStatus(SchedulingRequestStatus.PENDING);

        for (SchedulingRegisterRequest request : pending) {
            LocalDateTime createdAt = request.getCreatedAt();
            LocalDateTime expirationTime = createdAt.plusHours(72);

            if (now.isAfter(expirationTime)) {
                request.setStatus(SchedulingRequestStatus.CANCELLED);
            }
        }
    }
}
