package com.t2m.stem.sistema.de.gestao.de.audit_rio.security;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final JwtEncoder encoder;

    private static final long EXPIRATION_TIME = 36000L;

    public JwtService(JwtEncoder encoder) {
        this.encoder = encoder;
    }

    public String generateToken(Authentication authentication) {
        Instant now = Instant.now();

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        UUID userId = null;
        String cnpj = null;
        String name = null;

        if (authentication.getPrincipal() instanceof UserAuthenticated userAuthenticated) {
            userId = userAuthenticated.getUserId();
            cnpj = userAuthenticated.getCompanyCnpj();
            name = userAuthenticated.getName();
        }

        JwtClaimsSet.Builder claimsBuilder = JwtClaimsSet.builder()
                .issuer("spring-security-jwt")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(EXPIRATION_TIME))
                .subject(authentication.getName())
                .claim("roles", roles)
                .claim("userId", userId != null ? userId.toString() : "unknown");

        if (cnpj != null && !cnpj.isEmpty()) {
            claimsBuilder.claim("cnpj", cnpj);
        }

        if (name != null && !name.isEmpty()) {
            claimsBuilder.claim("name", name);
        }

        return encoder.encode(JwtEncoderParameters.from(claimsBuilder.build()))
                .getTokenValue();
    }
}