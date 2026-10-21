package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VenueRepository extends JpaRepository<Venue, UUID> {
}
