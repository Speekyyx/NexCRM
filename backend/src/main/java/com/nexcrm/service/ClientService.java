package com.nexcrm.service;

import com.nexcrm.dto.ClientDto;

import java.util.List;
import java.util.Optional;

public interface ClientService {
    ClientDto create(ClientDto clientDto);
    ClientDto update(Long id, ClientDto clientDto);
    void delete(Long id);
    Optional<ClientDto> findById(Long id);
    Optional<ClientDto> findByEmail(String email);
    List<ClientDto> findAll();
    boolean existsByEmail(String email);
} 