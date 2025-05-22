package com.nexcrm.service.impl;

import com.nexcrm.dto.CategoryDto;
import com.nexcrm.model.Category;
import com.nexcrm.repository.CategoryRepository;
import com.nexcrm.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryDto create(CategoryDto categoryDto) {
        log.info("Création d'une nouvelle catégorie: {}", categoryDto.getNom());
        
        if (categoryRepository.existsByNom(categoryDto.getNom())) {
            throw new IllegalArgumentException("Une catégorie avec ce nom existe déjà");
        }

        Category category = Category.builder()
                .nom(categoryDto.getNom())
                .description(categoryDto.getDescription())
                .build();

        Category savedCategory = categoryRepository.save(category);
        return CategoryDto.fromEntity(savedCategory);
    }

    @Override
    public CategoryDto update(Long id, CategoryDto categoryDto) {
        log.info("Mise à jour de la catégorie avec ID: {}", id);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Catégorie non trouvée avec l'ID: " + id));

        if (!category.getNom().equals(categoryDto.getNom()) && 
            categoryRepository.existsByNom(categoryDto.getNom())) {
            throw new IllegalArgumentException("Une catégorie avec ce nom existe déjà");
        }

        category.setNom(categoryDto.getNom());
        category.setDescription(categoryDto.getDescription());

        Category updatedCategory = categoryRepository.save(category);
        return CategoryDto.fromEntity(updatedCategory);
    }

    @Override
    public void delete(Long id) {
        log.info("Suppression de la catégorie avec ID: {}", id);
        
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Catégorie non trouvée avec l'ID: " + id);
        }

        categoryRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CategoryDto> findById(Long id) {
        log.info("Recherche de la catégorie avec ID: {}", id);
        return categoryRepository.findById(id)
                .map(CategoryDto::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> findAll() {
        log.info("Récupération de toutes les catégories");
        return categoryRepository.findAll().stream()
                .map(CategoryDto::fromEntity)
                .collect(Collectors.toList());
    }
} 