package com.nexcrm.config;

import com.nexcrm.model.User;
import com.nexcrm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Ne créer l'utilisateur admin que si aucun utilisateur n'existe déjà
        if (userRepository.count() == 0) {
            createAdminUser();
        }
    }

    private void createAdminUser() {
        log.info("Création de l'utilisateur administrateur par défaut");
        
        User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin"))
                .nom("Administrateur")
                .prenom("NexCRM")
                .email("admin@nexcrm.com")
                .role(User.Role.CHEF_PROJET)
                .build();
        
        userRepository.save(admin);
        
        log.info("Utilisateur administrateur créé avec succès : {}", admin.getUsername());
    }
} 