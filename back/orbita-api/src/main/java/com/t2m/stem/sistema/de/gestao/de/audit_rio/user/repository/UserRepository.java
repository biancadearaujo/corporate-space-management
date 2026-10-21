package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.UserRegistrationRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    boolean existsByCpfAndCompany(String cpf, Company company);
    boolean existsByCpfAndCompanyCompanyId(String cpf, UUID company);
    Optional<User> findByEmail(String email);
    Page<User> findByCompanyCompanyId(UUID companyId, Pageable pageable);
    boolean existsByUserIdAndCompanyCompanyId(UUID userId, UUID companyId);
    boolean existsByUsernameAndCompanyCompanyId(String username, UUID companyId);
    List<User> findByUsernameAndCompanyCompanyId(String username, UUID companyId);
    Optional<User> findByUserIdAndCompanyCompanyId(UUID userId, UUID companyId);
    List<User> findByRole(UserRole role);
}
