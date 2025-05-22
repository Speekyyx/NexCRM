package com.nexcrm.service;

import com.nexcrm.dto.CategoryDto;

import java.util.List;
import java.util.Optional;

public interface CategoryService {
    CategoryDto create(CategoryDto categoryDto);
    CategoryDto update(Long id, CategoryDto categoryDto);
    void delete(Long id);
    Optional<CategoryDto> findById(Long id);
    List<CategoryDto> findAll();
} 