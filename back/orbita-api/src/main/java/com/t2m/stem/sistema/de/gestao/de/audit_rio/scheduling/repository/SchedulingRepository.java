package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.Scheduling;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SchedulingRepository extends JpaRepository<Scheduling, UUID> {
    Optional<Scheduling> findBySchedulingIdAndCompany(UUID schedulingId, Company company);
    Page<Scheduling> findByCreatedByAndCompanyCompanyId(UUID userId, UUID companyId, Pageable pageable);
    Optional<Scheduling> findByCreatedByAndSchedulingIdAndCompany(UUID userId, UUID schedulingId, Company company);
    Page<Scheduling> findAllByCompanyCompanyId(UUID companyId, Pageable pageable);
    Optional<Scheduling> findBySchedulingIdAndCompanyCompanyId(UUID schedulingId, UUID companyId);
    @Query("SELECT COUNT(s) FROM Scheduling s WHERE s.startAt >= :start AND s.startAt <= :end")
    long countActiveReservationsInMonth(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query(value = """
    SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_at - start_at)) / 3600), 0) 
    FROM scheduling 
    WHERE start_at >= :start AND start_at <= :end
    """, nativeQuery = true)
    Double sumApprovedHoursInMonth(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    Scheduling findByRegisterRequest(SchedulingRegisterRequest registerRequest);
}