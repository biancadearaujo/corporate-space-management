package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.service;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto.VenueResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.repository.VenueRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class VenueService {
    private VenueRepository venueRepository;

    public Page<VenueResponseDTO> getAllVenues(Pageable pageable) {
        return venueRepository.findAll(pageable)
                .map(VenueResponseDTO::from);
    }

    public Venue findById(UUID venueId) {
        return venueRepository.findById(venueId)
                .orElseThrow(() -> new NotFoundException("Venue not found"));
    }

    //Centralizar a busca e validação de sub-auditórios.
    public SubVenue findSubVenueOrThrow(UUID subVenueId, Venue venue) {
        return venue.getSubVenues().stream()
                .filter(sv -> sv.getSubVenueId().equals(subVenueId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException(
                        "Sub-venue with id " + subVenueId + " not found in venue " + venue.getVenueId()));
    }
}
