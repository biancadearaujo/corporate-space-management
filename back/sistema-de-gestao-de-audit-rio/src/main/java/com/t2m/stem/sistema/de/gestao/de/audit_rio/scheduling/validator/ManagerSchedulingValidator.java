package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.validator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingUpdateDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRegisterRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class ManagerSchedulingValidator{
    private UserValidator userValidator;
    private SchedulingCreatorValidator schedulingCreatorValidator;
    private SchedulingUpdateValidator schedulingUpdateValidator;
    private SchedulingRegisterRequestRepository schedulingRegisterRequestRepository;

    public void managerValidateForCreate(SchedulingRegisterRequest schedulingRegisterRequest, Venue venue){
        schedulingCreatorValidator.validateCompanyIsActive();
        schedulingCreatorValidator.validateStartAtManager(schedulingRegisterRequest.getStartAt());
        schedulingCreatorValidator.validateEndAt(schedulingRegisterRequest.getStartAt(), schedulingRegisterRequest.getEndAt());
        schedulingCreatorValidator.validateOperatingHours(schedulingRegisterRequest, venue);
        schedulingCreatorValidator.validateCompanyQuota(schedulingRegisterRequest, venue, userValidator.getAuthenticatedUser().getCompany());

        if (schedulingRegisterRequest.getSubVenue() != null) {
            schedulingCreatorValidator.validateSubVenueAvailability(schedulingRegisterRequest, venue);
        } else {
            schedulingCreatorValidator.validateVenueAvailability(schedulingRegisterRequest, venue);
        }
    }

    public void managerValidateForUpdate(UUID schedulingId, SchedulingUpdateDTO schedulingUpdateDTO, Venue venue){
        SchedulingRegisterRequest existingRequest = schedulingRegisterRequestRepository.findById(schedulingId)
                .orElseThrow(() -> new NotFoundException("Scheduling not found"));

        if (schedulingUpdateDTO.startAt() != null) {
            schedulingUpdateValidator.validateStartAt(schedulingUpdateDTO, venue);
        }
        if (schedulingUpdateDTO.startAt() != null && schedulingUpdateDTO.endAt() != null) {
            schedulingUpdateValidator.validateEndAt(schedulingUpdateDTO.startAt(), schedulingUpdateDTO.endAt());
        }
        //todo:
        if (schedulingUpdateDTO.startAt() != null || schedulingUpdateDTO.endAt() != null) {
            schedulingUpdateValidator.validateOperatingHours(schedulingUpdateDTO, venue);
        }

        boolean scheduleChanged = false;

        if (schedulingUpdateDTO.startAt() != null && !schedulingUpdateDTO.startAt().equals(existingRequest.getStartAt())) {
            scheduleChanged = true;
        }
        if (schedulingUpdateDTO.endAt() != null && !schedulingUpdateDTO.endAt().equals(existingRequest.getEndAt())) {
            scheduleChanged = true;
        }
        if (scheduleChanged) {
            schedulingUpdateValidator.validateCompanyQuotaForUpdate(schedulingUpdateDTO, existingRequest, venue);
        }

        if (schedulingUpdateDTO.subVenueId() != null) {
            schedulingUpdateValidator.validateSubVenueAvailability(schedulingUpdateDTO, venue, schedulingId);
        } else {
            schedulingUpdateValidator.validateVenueAvailability(schedulingUpdateDTO, venue, schedulingId);
        }
    }
}