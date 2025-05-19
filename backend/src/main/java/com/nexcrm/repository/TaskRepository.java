package com.nexcrm.repository;

import com.nexcrm.model.Task;
import com.nexcrm.model.User;
import com.nexcrm.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedUsersContaining(User user);
    List<Task> findByClient(Client client);
    List<Task> findByStatut(Task.Status statut);
    List<Task> findByPriorite(Task.Priority priorite);
    List<Task> findByDateEcheanceBefore(LocalDate date);
    List<Task> findByDateEcheanceAfter(LocalDate date);
} 