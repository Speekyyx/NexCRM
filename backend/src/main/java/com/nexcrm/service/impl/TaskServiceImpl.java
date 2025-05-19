package com.nexcrm.service.impl;

import com.nexcrm.dto.TaskDto;
import com.nexcrm.model.Task;
import com.nexcrm.model.User;
import com.nexcrm.model.Client;
import com.nexcrm.repository.TaskRepository;
import com.nexcrm.repository.UserRepository;
import com.nexcrm.repository.ClientRepository;
import com.nexcrm.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;

    @Override
    public TaskDto create(TaskDto taskDto) {
        Task task = Task.builder()
                .titre(taskDto.getTitre())
                .description(taskDto.getDescription())
                .dateEcheance(taskDto.getDateEcheance())
                .priorite(taskDto.getPriorite())
                .statut(taskDto.getStatut() != null ? taskDto.getStatut() : Task.Status.A_FAIRE)
                .cout(taskDto.getCout())
                .build();

        // Assignation des utilisateurs
        if (taskDto.getAssignedUsers() != null && !taskDto.getAssignedUsers().isEmpty()) {
            Set<User> users = taskDto.getAssignedUsers().stream()
                    .map(userDto -> userRepository.findById(userDto.getId())
                            .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé")))
                    .collect(Collectors.toSet());
            task.setAssignedUsers(users);
        }

        // Assignation d'un client
        if (taskDto.getClient() != null && taskDto.getClient().getId() != null) {
            Client client = clientRepository.findById(taskDto.getClient().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Client non trouvé"));
            task.setClient(client);
        }

        Task savedTask = taskRepository.save(task);
        return TaskDto.fromEntity(savedTask);
    }

    @Override
    public TaskDto update(Long id, TaskDto taskDto) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tâche non trouvée avec l'ID: " + id));

        existingTask.setTitre(taskDto.getTitre());
        existingTask.setDescription(taskDto.getDescription());
        existingTask.setDateEcheance(taskDto.getDateEcheance());
        existingTask.setPriorite(taskDto.getPriorite());
        existingTask.setStatut(taskDto.getStatut());
        existingTask.setCout(taskDto.getCout());

        // Mise à jour des utilisateurs assignés
        if (taskDto.getAssignedUsers() != null) {
            Set<User> users = taskDto.getAssignedUsers().stream()
                    .map(userDto -> userRepository.findById(userDto.getId())
                            .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé")))
                    .collect(Collectors.toSet());
            existingTask.setAssignedUsers(users);
        } else {
            existingTask.setAssignedUsers(new HashSet<>());
        }

        // Mise à jour du client
        if (taskDto.getClient() != null && taskDto.getClient().getId() != null) {
            Client client = clientRepository.findById(taskDto.getClient().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Client non trouvé"));
            existingTask.setClient(client);
        } else {
            existingTask.setClient(null);
        }

        Task updatedTask = taskRepository.save(existingTask);
        return TaskDto.fromEntity(updatedTask);
    }

    @Override
    public void delete(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new IllegalArgumentException("Tâche non trouvée avec l'ID: " + id);
        }
        taskRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TaskDto> findById(Long id) {
        return taskRepository.findById(id)
                .map(TaskDto::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> findAll() {
        return taskRepository.findAll().stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> findByAssignedUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
        return taskRepository.findByAssignedUsersContaining(user).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> findByClientId(Long clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client non trouvé"));
        return taskRepository.findByClient(client).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> findByStatus(Task.Status status) {
        return taskRepository.findByStatut(status).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> findByPriority(Task.Priority priority) {
        return taskRepository.findByPriorite(priority).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> findByDueDateBefore(LocalDate date) {
        return taskRepository.findByDateEcheanceBefore(date).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskDto> findByDueDateAfter(LocalDate date) {
        return taskRepository.findByDateEcheanceAfter(date).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDto updateStatus(Long id, Task.Status status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tâche non trouvée avec l'ID: " + id));
        task.setStatut(status);
        Task updatedTask = taskRepository.save(task);
        return TaskDto.fromEntity(updatedTask);
    }

    @Override
    public TaskDto assignUser(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Tâche non trouvée avec l'ID: " + taskId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec l'ID: " + userId));
        
        if (task.getAssignedUsers() == null) {
            task.setAssignedUsers(new HashSet<>());
        }
        task.getAssignedUsers().add(user);
        
        Task updatedTask = taskRepository.save(task);
        return TaskDto.fromEntity(updatedTask);
    }

    @Override
    public TaskDto unassignUser(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Tâche non trouvée avec l'ID: " + taskId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec l'ID: " + userId));
        
        if (task.getAssignedUsers() != null) {
            task.getAssignedUsers().remove(user);
            Task updatedTask = taskRepository.save(task);
            return TaskDto.fromEntity(updatedTask);
        }
        return TaskDto.fromEntity(task);
    }
} 