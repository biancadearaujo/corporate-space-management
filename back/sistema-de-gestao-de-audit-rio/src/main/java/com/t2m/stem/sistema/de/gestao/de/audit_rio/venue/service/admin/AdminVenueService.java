package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.service.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.model.Accessibility;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.repository.AccessibilityRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.OpeningHours;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto.VenueRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto.VenueResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.repository.OpeningHoursRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.repository.VenueRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AdminVenueService {
    private VenueRepository venueRepository;
    private AccessibilityRepository accessibilityRepository;
    private UserValidator userValidator;
    private OpeningHoursRepository openingHoursRepository;

    public Page<VenueResponseDTO> getAllVenues(Pageable pageable){
        userValidator.validateAdminAccess();

        return venueRepository.findAll(pageable)
                .map(VenueResponseDTO::from);
    }

    public VenueResponseDTO getVenueById(UUID venueId){
        userValidator.validateAdminAccess();

        return venueRepository.findById(venueId)
                .map(VenueResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Venue not found"));
    }

    @Transactional
    public VenueResponseDTO createVenue(VenueRequestDTO venueDTO) {
        userValidator.validateAdminAccess();

        Accessibility accessibility = accessibilityRepository.findById(venueDTO.accessibilityId())
                .orElseThrow(() -> new NotFoundException("Company not found."));

        if (venueDTO.divisible() && (venueDTO.subVenues() == null || venueDTO.subVenues().isEmpty()
                || venueDTO.venueType() != VenueType.AUDITORIUM)) {
            throw new IllegalArgumentException("Divisible venue must have at least one sub-venue");
        }

        Venue venue = new Venue();

        venue.setName(venueDTO.name());
        venue.setCapacity(venueDTO.capacity());
        venue.setSize(venueDTO.size());
        venue.setImage(venueDTO.image());
        venue.setParking(venueDTO.parking());
        venue.setAccessibility(accessibility);
        venue.setVenueType(venueDTO.venueType());
        venue.setDivisible(venueDTO.divisible());
        venue.setMaximumMonths(venueDTO.maximumMonths());
        venue.setMinimumHoursToCancel(venueDTO.minimumHoursToCancel());

        Venue savedVenue = venueRepository.save(venue);

        if (venueDTO.openingHours() != null && !venueDTO.openingHours().isEmpty()) {
            List<OpeningHours> openingHoursList = venueDTO.openingHours().stream().map(openingHoursDTO -> {
                OpeningHours openingHours = new OpeningHours();
                openingHours.setDayOfWeek(openingHoursDTO.dayOfWeek());
                openingHours.setOpeningTime(openingHoursDTO.openingTime());
                openingHours.setClosingTime(openingHoursDTO.closingTime());
                openingHours.setVenue(savedVenue);
                return openingHours;
            }).toList();

            openingHoursRepository.saveAll(openingHoursList);
        }

        if (venueDTO.divisible()) {
            venueDTO.subVenues().forEach(subVenueDto -> {
                SubVenue subVenue = new SubVenue();
                subVenue.setName(subVenueDto.name());
                subVenue.setCapacity(subVenueDto.capacity());
                subVenue.setMaximumMonths(subVenueDto.maximumMonths());
                venue.addSubVenue(subVenue);
            });

            venueRepository.save(savedVenue);
        }
        return VenueResponseDTO.from(savedVenue);
    }

    @Transactional
    public VenueResponseDTO updateVenue(UUID venueId, VenueRequestDTO venueDTO){
        userValidator.validateAdminAccess();

        Venue venue = venueRepository.findById(venueId).orElseThrow(() ->
                new NotFoundException("Venue not found"));

        if (venueDTO.name() != null){
            venue.setName(venueDTO.name());
        }
        if (venueDTO.capacity() != null){
            venue.setCapacity(venueDTO.capacity());
        }
        if (venueDTO.size() != null){
            venue.setSize(venueDTO.size());
        }
        if (venueDTO.image() != null){
            venue.setImage(venueDTO.image());
        }
        if (venueDTO.parking() != null){
            venue.setParking(venueDTO.parking());
        }

        Venue updated = venueRepository.save(venue);
        return VenueResponseDTO.from(updated);
    }

    @Transactional
    public void deleteVenue(UUID venueId){
        userValidator.validateAdminAccess();

        venueRepository.findById(venueId)
                .orElseThrow(() -> new NotFoundException("Venue not found"));

        venueRepository.deleteById(venueId);
    }
}
