package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.RequestStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity(name = "users_rejected_request")
public class UserRejectedRequest {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "cpf", unique = true)
    private String cpf;

    @Column(name = "photo_url", nullable = true)
    private String photoUrl;

    @Column(name = "phone_number", nullable = true, unique = true)
    @Pattern(
            regexp = "^\\(?(\\d{2})\\)?[\\s-]?(\\d{4,5})[\\s-]?(\\d{4})$",
            message = "Invalid phone number. Use (XX) XXXX-XXXX ou (XX) 9XXXX-XXXX"
    )
    private String phoneNumber;

    @Column(name = "rg_number", nullable = false, unique = true)
    @Pattern(
            regexp = "^([0-9]{1,2}\\.?[0-9]{3}\\.?[0-9]{3}-?[0-9Xx])|([0-9]{8,10})$",
            message = "Invalid ID. Use XX.XXX.XXX-X ou XXXXXXXX"
    )
    private String rgNumber;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = true)
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private RequestStatus status;

    @Column(name = "decided_by", nullable = true)
    private UUID managerId;

    @Column(name = "decided_at", nullable = true)
    private LocalDateTime decidedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;
}