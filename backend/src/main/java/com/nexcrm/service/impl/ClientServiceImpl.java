package com.nexcrm.service.impl;

import com.nexcrm.dto.ClientDto;
import com.nexcrm.exception.EmailAlreadyExistsException;
import com.nexcrm.model.Client;
import com.nexcrm.repository.ClientRepository;
import com.nexcrm.service.ClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;

    @Override
    public ClientDto create(ClientDto clientDto) {
        log.info("Création d'un nouveau client: {}", clientDto.getNom());
        
        // Vérifier si l'email existe déjà
        if (clientRepository.existsByEmail(clientDto.getEmail())) {
            log.error("Un client avec l'email {} existe déjà", clientDto.getEmail());
            throw new EmailAlreadyExistsException(clientDto.getEmail());
        }
        
        // Convertir DTO en entité
        Client client = Client.builder()
                .nom(clientDto.getNom())
                .email(clientDto.getEmail())
                .telephone(clientDto.getTelephone())
                .adresse(clientDto.getAdresse())
                .societe(clientDto.getSociete())
                .build();
        
        // Sauvegarder et retourner le résultat
        Client savedClient = clientRepository.save(client);
        return ClientDto.fromEntity(savedClient);
    }

    @Override
    public ClientDto update(Long id, ClientDto clientDto) {
        log.info("Mise à jour du client avec ID: {}", id);
        
        // Vérifier si le client existe
        Client existingClient = clientRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Client avec ID {} non trouvé", id);
                    return new IllegalArgumentException("Client non trouvé");
                });
        
        // Vérifier si l'email est déjà utilisé par un autre client
        if (!existingClient.getEmail().equals(clientDto.getEmail()) 
                && clientRepository.existsByEmail(clientDto.getEmail())) {
            log.error("Un autre client utilise déjà l'email {}", clientDto.getEmail());
            throw new EmailAlreadyExistsException(clientDto.getEmail());
        }
        
        // Mettre à jour les champs
        existingClient.setNom(clientDto.getNom());
        existingClient.setEmail(clientDto.getEmail());
        existingClient.setTelephone(clientDto.getTelephone());
        existingClient.setAdresse(clientDto.getAdresse());
        existingClient.setSociete(clientDto.getSociete());
        
        // Sauvegarder et retourner le résultat
        Client updatedClient = clientRepository.save(existingClient);
        return ClientDto.fromEntity(updatedClient);
    }

    @Override
    public void delete(Long id) {
        log.info("Suppression du client avec ID: {}", id);
        
        // Vérifier si le client existe
        if (!clientRepository.existsById(id)) {
            log.error("Client avec ID {} non trouvé pour la suppression", id);
            throw new IllegalArgumentException("Client non trouvé");
        }
        
        clientRepository.deleteById(id);
        log.info("Client avec ID {} supprimé avec succès", id);
    }

    @Override
    public Optional<ClientDto> findById(Long id) {
        log.info("Recherche du client avec ID: {}", id);
        return clientRepository.findById(id)
                .map(ClientDto::fromEntity);
    }

    @Override
    public Optional<ClientDto> findByEmail(String email) {
        log.info("Recherche du client avec email: {}", email);
        return clientRepository.findByEmail(email)
                .map(ClientDto::fromEntity);
    }

    @Override
    public List<ClientDto> findAll() {
        log.info("Récupération de tous les clients");
        return clientRepository.findAll().stream()
                .map(ClientDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByEmail(String email) {
        return clientRepository.existsByEmail(email);
    }
} 