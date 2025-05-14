package com.nexcrm.dto;

import com.nexcrm.model.Category;
import com.nexcrm.model.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;
    private String titre;
    private String description;
    private LocalDate dateEcheance;
    private Task.Priority priorite;
    private Task.Status statut;
    private UserDto assignedUser;
    private ClientDto client;
    private BigDecimal cout;
    private Set<CategoryDto> categories;
    private LocalDate dateCreation;

    public static TaskDto fromEntity(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .titre(task.getTitre())
                .description(task.getDescription())
                .dateEcheance(task.getDateEcheance())
                .priorite(task.getPriorite())
                .statut(task.getStatut())
                .assignedUser(task.getAssignedUser() != null ? UserDto.fromEntity(task.getAssignedUser()) : null)
                .client(task.getClient() != null ? ClientDto.fromEntity(task.getClient()) : null)
                .cout(task.getCout())
                .categories(task.getCategories() != null ? 
                        task.getCategories().stream()
                                .map(CategoryDto::fromEntity)
                                .collect(Collectors.toSet()) : null)
                .dateCreation(task.getDateCreation())
                .build();
    }
} 