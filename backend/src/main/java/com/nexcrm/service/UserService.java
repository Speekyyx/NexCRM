package com.nexcrm.service;

import com.nexcrm.dto.UserDto;
import com.nexcrm.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    UserDto create(UserDto userDto);
    UserDto update(Long id, UserDto userDto);
    void delete(Long id);
    Optional<UserDto> findById(Long id);
    Optional<UserDto> findByUsername(String username);
    List<UserDto> findAll();
    List<UserDto> findByRole(User.Role role);
} 