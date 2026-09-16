package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.controller.user;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserRegistrationResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.user.UserService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserRegistrationRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRegistrationRequestRepository;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
public class    RegistrationRequestController {
    private UserService userService;

    @PostMapping
    public ResponseEntity<UserRegistrationResponseDTO> userRegistrationRequest(@Valid @RequestBody UserRegistrationRequestDTO userRegistrationRequestDTO) {
        var user = userService.userRegistrationRequest(userRegistrationRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
}
