package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.collaborator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class CollaboratorCompanyService {
    private UserRepository userRepository;
    private CompanyRepository companyRepository;

    @Transactional
    public void exitCompany(UUID userId) {
        var user = userRepository.findById(userId).orElseThrow(() ->
                new NotFoundException("User not found"));

        var company = companyRepository.findById(user.getCompany().getCompanyId()).orElseThrow(() ->
                new NotFoundException("Company not found"));

        if (!user.getCompany().getCompanyId().equals(company.getCompanyId())) {
            throw new IllegalArgumentException("User does not belong to this company");
        }

        userRepository.deleteById(userId);
    }
}
