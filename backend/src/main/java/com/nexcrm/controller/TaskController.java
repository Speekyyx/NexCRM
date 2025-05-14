package com.nexcrm.controller;

import com.nexcrm.dto.TaskDto;
import com.nexcrm.model.Task;
import com.nexcrm.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    // Désactiver temporairement la vérification d'autorisation
    // @PreAuthorize("hasAnyRole('CHEF_PROJET')")
    public ResponseEntity<TaskDto> createTask(@RequestBody TaskDto taskDto) {
        return ResponseEntity.ok(taskService.create(taskDto));
    }

    @PutMapping("/{id}")
    // Désactiver temporairement la vérification d'autorisation
    // @PreAuthorize("hasAnyRole('CHEF_PROJET', 'DEVELOPPEUR')")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @RequestBody TaskDto taskDto) {
        return ResponseEntity.ok(taskService.update(id, taskDto));
    }

    @DeleteMapping("/{id}")
    // Désactiver temporairement la vérification d'autorisation
    // @PreAuthorize("hasAnyRole('CHEF_PROJET')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTask(@PathVariable Long id) {
        return taskService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        return ResponseEntity.ok(taskService.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TaskDto>> getTasksByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.findByAssignedUserId(userId));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<TaskDto>> getTasksByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(taskService.findByClientId(clientId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TaskDto>> getTasksByStatus(@PathVariable Task.Status status) {
        return ResponseEntity.ok(taskService.findByStatus(status));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<TaskDto>> getTasksByPriority(@PathVariable Task.Priority priority) {
        return ResponseEntity.ok(taskService.findByPriority(priority));
    }

    @GetMapping("/due-before")
    public ResponseEntity<List<TaskDto>> getTasksDueBefore(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(taskService.findByDueDateBefore(localDate));
    }

    @GetMapping("/due-after")
    public ResponseEntity<List<TaskDto>> getTasksDueAfter(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(taskService.findByDueDateAfter(localDate));
    }

    @PatchMapping("/{id}/status/{status}")
    public ResponseEntity<TaskDto> updateTaskStatus(@PathVariable Long id, @PathVariable Task.Status status) {
        return ResponseEntity.ok(taskService.updateStatus(id, status));
    }

    @PatchMapping("/{taskId}/assign/{userId}")
    // Désactiver temporairement la vérification d'autorisation
    // @PreAuthorize("hasAnyRole('CHEF_PROJET')")
    public ResponseEntity<TaskDto> assignTaskToUser(@PathVariable Long taskId, @PathVariable Long userId) {
        return ResponseEntity.ok(taskService.assignUser(taskId, userId));
    }
} 