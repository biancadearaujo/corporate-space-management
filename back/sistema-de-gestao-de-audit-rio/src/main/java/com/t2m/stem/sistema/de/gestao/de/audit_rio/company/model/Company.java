package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.validator.constraints.br.CNPJ;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Entity(name="companies")
@SQLDelete(sql = "UPDATE companies SET deleted = true WHERE company_id = ?")
public class Company {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID companyId;

    @Column(name="name", nullable = false)
    @Size(min = 1, max = 100, message = "Name must be between 2 and 100 characters.")
    private String name;

    @Column(name="email", nullable = false, unique = true)
    @Email(message = "Email is not valid")
    private String email;

    @Column(name="cnpj", nullable = false, unique = true)
    @CNPJ(message = "CNPJ is not valid")
    private String cnpj;

    private boolean deleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<User> users;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompanyHoursQuota> hoursQuotas;
}
