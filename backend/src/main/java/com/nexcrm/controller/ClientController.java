package com.nexcrm.controller;

import com.nexcrm.dto.ClientDto;
import com.nexcrm.service.ClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@Slf4j
public class ClientController {

    private final ClientService clientService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CHEF_PROJET')")
    public ResponseEntity<ClientDto> createClient(@RequestBody ClientDto clientDto) {
        log.info("Requête de création d'un client reçue: {}", clientDto.getNom());
        return new ResponseEntity<>(clientService.create(clientDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CHEF_PROJET')")
    public ResponseEntity<ClientDto> updateClient(@PathVariable Long id, @RequestBody ClientDto clientDto) {
        log.info("Requête de mise à jour du client avec ID: {}", id);
        return ResponseEntity.ok(clientService.update(id, clientDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CHEF_PROJET')")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        log.info("Requête de suppression du client avec ID: {}", id);
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CHEF_PROJET')")
    public ResponseEntity<ClientDto> getClient(@PathVariable Long id) {
        log.info("Requête pour obtenir le client avec ID: {}", id);
        return clientService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CHEF_PROJET')")
    public ResponseEntity<List<ClientDto>> getAllClients() {
        log.info("Requête pour obtenir tous les clients");
        return ResponseEntity.ok(clientService.findAll());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ClientDto> getClientByEmail(@PathVariable String email) {
        log.info("Requête pour obtenir le client avec email: {}", email);
        return clientService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        log.info("Vérification si l'email existe: {}", email);
        boolean exists = clientService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }
} 