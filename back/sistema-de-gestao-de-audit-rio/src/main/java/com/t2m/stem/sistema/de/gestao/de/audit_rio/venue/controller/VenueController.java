package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.controller;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto.VenueResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.service.VenueService;
import jakarta.annotation.security.PermitAll;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class VenueController {
    private VenueService venueService;

    @PermitAll
    @GetMapping({"/venue"})
    public ResponseEntity<Page<VenueResponseDTO>> getAllVenue(
            @PageableDefault(
                    size = 20,
                    sort = "name") Pageable pageable){
        var venue = venueService.getAllVenues(pageable);
        return ResponseEntity.ok(venue);
    }
}
