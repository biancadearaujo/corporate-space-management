package com.t2m.stem.sistema.de.gestao.de.audit_rio.security;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .map(user -> new UserAuthenticated(user))
                .orElseThrow(
                        () -> new UsernameNotFoundException("User Not Found with email: " + email));
    }
}

