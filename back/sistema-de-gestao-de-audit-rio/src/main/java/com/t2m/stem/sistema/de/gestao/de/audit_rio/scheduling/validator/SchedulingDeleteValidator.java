package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.validator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.Scheduling;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class SchedulingDeleteValidator {
    public void validateCancellationDeadline(LocalDateTime startAt, Venue venue) {
        int deadlineHours = venue.getCancellationDeadlineHours();
        LocalDateTime cancellationDeadline = startAt.minusHours(deadlineHours);
        if (LocalDateTime.now().isAfter(cancellationDeadline)){
            throw new IllegalArgumentException("Cancellation deadline has passed");
        }
    }
}
