package com.nexcrm.dto;

import com.nexcrm.model.Category;
import com.nexcrm.model.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.HashSet;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Slf4j
public class TaskDto {
    private Long id;
    private String titre;
    private String description;
    private LocalDate dateEcheance;
    private Task.Priority priorite;
    private Task.Status statut;
    private Set<UserDto> assignedUsers;
    private ClientDto client;
    private BigDecimal cout;
    private Set<CategoryDto> categories;
    private LocalDate dateCreation;

    public static TaskDto fromEntity(Task task) {
        log.debug("Conversion de Task en TaskDto - ID: {}", task.getId());
        if (task.getCategories() != null) {
            log.debug("Catégories de la tâche avant conversion: {}", 
                task.getCategories().stream()
                    .map(cat -> String.format("ID: %d, Nom: %s", cat.getId(), cat.getNom()))
                    .collect(Collectors.joining(", "))
            );
        }
        
        TaskDto dto = TaskDto.builder()
                .id(task.getId())
                .titre(task.getTitre())
                .description(task.getDescription())
                .dateEcheance(task.getDateEcheance())
                .priorite(task.getPriorite())
                .statut(task.getStatut())
                .assignedUsers(task.getAssignedUsers() != null ? 
                        task.getAssignedUsers().stream()
                                .map(UserDto::fromEntity)
                                .collect(Collectors.toSet()) : new HashSet<>())
                .client(task.getClient() != null ? ClientDto.fromEntity(task.getClient()) : null)
                .cout(task.getCout())
                .categories(task.getCategories() != null ? 
                        task.getCategories().stream()
                                .map(CategoryDto::fromEntity)
                                .collect(Collectors.toSet()) : new HashSet<>())
                .dateCreation(task.getDateCreation())
                .build();
                
        if (dto.getCategories() != null) {
            log.debug("Catégories dans le DTO après conversion: {}", 
                dto.getCategories().stream()
                    .map(cat -> String.format("ID: %d, Nom: %s", cat.getId(), cat.getNom()))
                    .collect(Collectors.joining(", "))
            );
        }
        
        return dto;
    }
} 