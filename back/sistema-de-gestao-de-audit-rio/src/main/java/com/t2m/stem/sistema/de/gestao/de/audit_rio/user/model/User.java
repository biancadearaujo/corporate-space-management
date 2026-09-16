package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import org.hibernate.validator.constraints.br.CPF;

import java.util.UUID;

@Data
@Entity(name = "users")
@Table(
        name = "users",
        uniqueConstraints = {
                // Garante que CPF não se repita na mesma empresa.
                @UniqueConstraint(
                        name = "uk_cpf_company",
                        columnNames = {"cpf", "company_id"}
                )
        }
)
public class User {

    @Id
    @GeneratedValue(generator = "UUID")
    private UUID userId;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "email", unique = true)
    @Email(message = "Email is not valid")
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "cpf")
    @CPF(message = "CPF is not valid")
    private String cpf;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = true)
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @Column(name = "photo_url", nullable = true)
    private String photoUrl;

    @Column(name = "phone_number", nullable = true)
    @Pattern(
            regexp = "^\\(?(\\d{2})\\)?[\\s-]?(\\d{4,5})[\\s-]?(\\d{4})$",
            message = "Invalid phone number. Use (XX) XXXX-XXXX ou (XX) 9XXXX-XXXX"
    )
    private String phoneNumber;

    @Column(name = "rg_number", nullable = false)
    @Pattern(
            regexp = "^([0-9]{1,2}\\.?[0-9]{3}\\.?[0-9]{3}-?[0-9Xx])|([0-9]{8,10})$",
            message = "Invalid ID. Use XX.XXX.XXX-X ou XXXXXXXX"
    )
    private String rgNumber;

    private String department;

    public boolean isManager() {return this.role.equals(UserRole.MANAGER);}

    public boolean isAdmin() {
        return this.role.equals(UserRole.ADMIN);
    }

    public boolean isCollaborator() {
        return this.role.equals(UserRole.COLLABORATOR);
    }
}
