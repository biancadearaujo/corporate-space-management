package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SchedulingRegisterRequestRepository extends JpaRepository<SchedulingRegisterRequest, UUID> {
    List<SchedulingRegisterRequest> findByStatus(SchedulingRequestStatus status);
    List<SchedulingRegisterRequest> findByStatusAndCompanyAndCreatedBy(SchedulingRequestStatus status, Company company,
                                                                       UUID userId);

    @Query("SELECT s FROM SchedulingRegisterRequest s " +
            "WHERE s.venue = :venue " +
            "AND s.startAt = :startAt " +
            "AND s.endAt = :endAt " +
            "AND s.status NOT IN ('REJECTED', 'CANCELLED')")
    Optional<SchedulingRegisterRequest> findExactMatchIfNotRejectedOrCancelled(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("venue") Venue venue);

    @Query("""
    SELECT s FROM SchedulingRegisterRequest s
    WHERE s.subVenue = :subVenue
    AND s.status NOT IN ('REJECTED', 'CANCELLED')
    AND (
        (s.startAt < :endAt AND s.endAt > :startAt) OR
        (s.startAt = :startAt AND s.endAt = :endAt)
    )
    """)
    List<SchedulingRegisterRequest> findConflictingSubVenueSchedules(
            @Param("subVenue") SubVenue subVenue,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt);

    @Query("SELECT s FROM SchedulingRegisterRequest s " +
            "WHERE s.company.companyId = :companyId " +
            "AND s.venue.venueType = :venueType " +
            "AND s.startAt BETWEEN :start AND :end")
    List<SchedulingRegisterRequest> findByCompanyIdAndVenueTypeAndDateRange(
            @Param("companyId") UUID companyId,
            @Param("venueType") VenueType venueType,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    //@Query("SELECT s FROM SchedulingRegisterRequest s WHERE s.venue = :venue AND DATE(s.startAt) = :date")
    //List<SchedulingRegisterRequest> findAllByVenueAndDate(@Param("venue") Venue venue, @Param("date") LocalDate date);

    //@Query("SELECT s FROM SchedulingRegisterRequest s WHERE s.subVenue = :subVenue AND DATE(s.startAt) = :date")
    //List<SchedulingRegisterRequest> findAllBySubVenueAndDate(@Param("subVenue") SubVenue subVenue, @Param("date") LocalDate date);

    @Query("SELECT s FROM SchedulingRegisterRequest s " +
            "WHERE s.venue = :venue " +
            "AND DATE(s.startAt) = :date " +
            "AND s.status NOT IN ('CANCELLED', 'REJECTED')")
    List<SchedulingRegisterRequest> findAllByVenueAndDate(
            @Param("venue") Venue venue,
            @Param("date") LocalDate date
    );

    @Query("SELECT s FROM SchedulingRegisterRequest s " +
            "WHERE s.subVenue = :subVenue " +
            "AND DATE(s.startAt) = :date " +
            "AND s.status NOT IN ('CANCELLED', 'REJECTED')")
    List<SchedulingRegisterRequest> findAllBySubVenueAndDate(
            @Param("subVenue") SubVenue subVenue,
            @Param("date") LocalDate date
    );

    List<SchedulingRegisterRequest> findByStatusAndCompanyCompanyId(SchedulingRequestStatus status, UUID companyId);
    Optional<SchedulingRegisterRequest> findBySchedulingIdAndCompanyCompanyId(UUID schedulingId, UUID companyId);
    Page<SchedulingRegisterRequest> findAllByCompanyCompanyId(UUID companyId, Pageable pageable);
}