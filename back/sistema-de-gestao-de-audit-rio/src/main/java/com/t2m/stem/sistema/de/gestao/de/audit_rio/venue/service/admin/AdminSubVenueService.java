package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.service.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto.SubVenueRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto.SubVenueResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.repository.SubVenueRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class AdminSubVenueService {
    private SubVenueRepository subVenueRepository;
    private UserValidator userValidator;

    public Page<SubVenueResponseDTO> getAllVenues(Pageable pageable){
        userValidator.validateAdminAccess();

        return subVenueRepository.findAll(pageable)
                .map(SubVenueResponseDTO::from);
    }

    public SubVenueResponseDTO getSubVenueById(UUID subVenueId){
        userValidator.validateAdminAccess();

        return subVenueRepository.findById(subVenueId)
                .map(SubVenueResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Sub-venue not found"));
    }

    public SubVenueResponseDTO updateSubVenue(UUID subVenueId, SubVenueRequestDTO subVenueRequest){
        userValidator.validateAdminAccess();

        SubVenue subVenue = subVenueRepository.findById(subVenueId).orElseThrow(() ->
                new NotFoundException("Sub Venue not found"));

        if (subVenueRequest.name() != null){
            subVenue.setName(subVenueRequest.name());
        }
        if (subVenueRequest.capacity() != null){
            subVenue.setCapacity(subVenueRequest.capacity());
        }

        SubVenue updated = subVenueRepository.save(subVenue);

        return SubVenueResponseDTO.from(updated);
    }
}
