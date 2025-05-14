package com.nexcrm.service;

import com.nexcrm.dto.TaskDto;
import com.nexcrm.model.Task;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TaskService {
    TaskDto create(TaskDto taskDto);
    TaskDto update(Long id, TaskDto taskDto);
    void delete(Long id);
    Optional<TaskDto> findById(Long id);
    List<TaskDto> findAll();
    List<TaskDto> findByAssignedUserId(Long userId);
    List<TaskDto> findByClientId(Long clientId);
    List<TaskDto> findByStatus(Task.Status status);
    List<TaskDto> findByPriority(Task.Priority priority);
    List<TaskDto> findByDueDateBefore(LocalDate date);
    List<TaskDto> findByDueDateAfter(LocalDate date);
    TaskDto updateStatus(Long id, Task.Status status);
    TaskDto assignUser(Long taskId, Long userId);
} 