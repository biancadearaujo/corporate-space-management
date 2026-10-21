package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.OpeningHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;

@Repository
public interface OpeningHoursRepository extends JpaRepository<OpeningHours, UUID> {
    List<OpeningHours> findByVenue_VenueIdAndDayOfWeek(UUID venueId, DayOfWeek dayOfWeek);
}
