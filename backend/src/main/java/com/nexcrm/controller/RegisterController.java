package com.nexcrm.controller;

import com.nexcrm.dto.AuthResponseDto;
import com.nexcrm.dto.RegisterRequestDto;
import com.nexcrm.dto.UserDto;
import com.nexcrm.security.JwtTokenUtil;
import com.nexcrm.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class RegisterController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserService userService;

    @PostMapping({"/register", "/auth/register"})
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        log.info("Requête d'inscription reçue pour l'utilisateur: {}", request.getUsername());
        try {
            // Vérification si le mot de passe et sa confirmation correspondent
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.badRequest()
                        .body(new AuthResponseDto("Erreur: Les mots de passe ne correspondent pas", null));
            }
            
            // Convertir RegisterRequestDto en UserDto
            UserDto userDto = UserDto.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .nom(request.getNom())
                    .prenom(request.getPrenom())
                    .role(request.getRole())
                    .build();
            
            // Créer l'utilisateur
            UserDto createdUser = userService.createWithPassword(userDto, request.getPassword());
            log.info("Utilisateur créé avec succès: {}", createdUser.getUsername());
            
            // Si l'inscription a réussi, on peut connecter automatiquement l'utilisateur
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Générer le token JWT
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtTokenUtil.generateToken(userDetails);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthResponseDto(jwt, createdUser));
        } catch (Exception e) {
            log.error("Erreur lors de l'inscription: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(new AuthResponseDto("Erreur: " + e.getMessage(), null));
        }
    }
} 