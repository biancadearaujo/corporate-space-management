package com.t2m.stem.sistema.de.gestao.de.audit_rio.security;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class UserAuthenticated implements UserDetails {
    private final User user;

    public UserAuthenticated(User user) {
        this.user = user;
    }

    public String getCompanyCnpj() {
        return (user.getCompany() != null) ? user.getCompany().getCnpj() : null;
    }

    public String getName() {
        return (user.getUsername() != null) ? user.getUsername() : null;
    }

    public UUID getUserId() {
        return user.getUserId();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}