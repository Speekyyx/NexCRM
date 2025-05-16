package com.nexcrm.service;

import com.nexcrm.dto.CommentDto;
import com.nexcrm.model.Comment;
import com.nexcrm.model.Task;
import com.nexcrm.model.User;
import com.nexcrm.model.Client;
import com.nexcrm.repository.CommentRepository;
import com.nexcrm.repository.TaskRepository;
import com.nexcrm.repository.UserRepository;
import com.nexcrm.repository.ClientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final NotificationService notificationService;

    public CommentDto toDto(Comment comment) {
        log.info("Conversion d'un commentaire ID {} en DTO", comment.getId());
        
        Set<Long> mentionedUserIds = new HashSet<>();
        Set<String> mentionedUsernames = new HashSet<>();
        Set<Long> mentionedClientIds = new HashSet<>();
        Set<String> mentionedClientNames = new HashSet<>();
        
        try {
            if (comment.getMentionedUsers() != null && !comment.getMentionedUsers().isEmpty()) {
                mentionedUserIds = comment.getMentionedUsers().stream()
                    .map(User::getId)
                    .collect(Collectors.toSet());
                
                mentionedUsernames = comment.getMentionedUsers().stream()
                    .map(User::getUsername)
                    .collect(Collectors.toSet());
                
                log.info("Commentaire {} contient {} mentions d'utilisateurs: {}", 
                    comment.getId(), mentionedUserIds.size(), mentionedUsernames);
            } else {
                log.info("Commentaire {} ne contient pas de mentions d'utilisateurs", comment.getId());
            }
            
            if (comment.getMentionedClients() != null && !comment.getMentionedClients().isEmpty()) {
                mentionedClientIds = comment.getMentionedClients().stream()
                    .map(Client::getId)
                    .collect(Collectors.toSet());
                    
                mentionedClientNames = comment.getMentionedClients().stream()
                    .map(Client::getNom)
                    .collect(Collectors.toSet());
                    
                log.info("Commentaire {} contient {} mentions de clients: {}", 
                    comment.getId(), mentionedClientIds.size(), mentionedClientNames);
            } else {
                log.info("Commentaire {} ne contient pas de mentions de clients", comment.getId());
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'extraction des mentions du commentaire {}: {}", comment.getId(), e.getMessage());
        }
        
        CommentDto dto = CommentDto.builder()
                .id(comment.getId())
                .contenu(comment.getContenu())
                .taskId(comment.getTask().getId())
                .authorId(comment.getAuthor().getId())
                .authorUsername(comment.getAuthor().getUsername())
                .dateCreation(comment.getDateCreation())
                .build();
        
        // Ajouter les mentions seulement si elles ne sont pas vides
        if (!mentionedUserIds.isEmpty()) {
            dto.setMentionedUserIds(mentionedUserIds);
            dto.setMentionedUsernames(mentionedUsernames);
        }
        
        if (!mentionedClientIds.isEmpty()) {
            dto.setMentionedClientIds(mentionedClientIds);
            dto.setMentionedClientNames(mentionedClientNames);
        }
        
        log.info("DTO créé avec succès: {}", dto);
        return dto;
    }

    public Comment toEntity(CommentDto commentDto) {
        log.info("Conversion d'un DTO en entité Commentaire");
        log.info("Contenu brut des mentions - utilisateurs: {}, clients: {}", 
            commentDto.getMentionedUserIds(), commentDto.getMentionedClientIds());
        
        Task task = taskRepository.findById(commentDto.getTaskId())
                .orElseThrow(() -> new EntityNotFoundException("Tâche non trouvée avec ID: " + commentDto.getTaskId()));
        
        User author = userRepository.findById(commentDto.getAuthorId())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé avec ID: " + commentDto.getAuthorId()));
        
        Comment comment = Comment.builder()
                .contenu(commentDto.getContenu())
                .task(task)
                .author(author)
                .dateCreation(commentDto.getDateCreation() != null ? commentDto.getDateCreation() : LocalDateTime.now())
                .mentionedUsers(new HashSet<>())  // Initialiser avec des ensembles vides
                .mentionedClients(new HashSet<>())
                .build();
                
        // Ne définir l'ID que s'il est présent
        if (commentDto.getId() != null) {
            comment.setId(commentDto.getId());
        }

        // Gérer les mentions d'utilisateurs
        if (commentDto.getMentionedUserIds() != null && !commentDto.getMentionedUserIds().isEmpty()) {
            log.info("Traitement de {} mentions d'utilisateurs: {}", 
                commentDto.getMentionedUserIds().size(), commentDto.getMentionedUserIds());
                
            for (Long userId : commentDto.getMentionedUserIds()) {
                try {
                    User user = userRepository.findById(userId)
                        .orElseThrow(() -> new EntityNotFoundException("Utilisateur mentionné non trouvé avec ID: " + userId));
                    comment.getMentionedUsers().add(user);
                    log.info("Utilisateur mentionné ajouté: {}", user.getUsername());
                } catch (Exception e) {
                    log.error("Erreur lors de la récupération de l'utilisateur mentionné avec ID {}: {}", userId, e.getMessage());
                }
            }
            log.info("Nombre final d'utilisateurs mentionnés: {}", comment.getMentionedUsers().size());
        } else {
            log.info("Aucune mention d'utilisateur trouvée dans le commentaire");
        }

        // Gérer les mentions de clients
        if (commentDto.getMentionedClientIds() != null && !commentDto.getMentionedClientIds().isEmpty()) {
            log.info("Traitement de {} mentions de clients: {}", 
                commentDto.getMentionedClientIds().size(), commentDto.getMentionedClientIds());
                
            for (Long clientId : commentDto.getMentionedClientIds()) {
                try {
                    Client client = clientRepository.findById(clientId)
                        .orElseThrow(() -> new EntityNotFoundException("Client mentionné non trouvé avec ID: " + clientId));
                    comment.getMentionedClients().add(client);
                    log.info("Client mentionné ajouté: {}", client.getNom());
                } catch (Exception e) {
                    log.error("Erreur lors de la récupération du client mentionné avec ID {}: {}", clientId, e.getMessage());
                }
            }
            log.info("Nombre final de clients mentionnés: {}", comment.getMentionedClients().size());
        } else {
            log.info("Aucune mention de client trouvée dans le commentaire");
        }
        
        return comment;
    }

    @Transactional
    public CommentDto create(CommentDto commentDto) {
        log.info("Création d'un nouveau commentaire avec mentions utilisateurs: {} et mentions clients: {}", 
            commentDto.getMentionedUserIds(), commentDto.getMentionedClientIds());
            
        Comment comment = toEntity(commentDto);
        Comment savedComment = commentRepository.save(comment);
        log.info("Commentaire créé avec succès, ID: {}", savedComment.getId());
        
        // Créer des notifications pour chaque utilisateur mentionné
        if (commentDto.getMentionedUserIds() != null && !commentDto.getMentionedUserIds().isEmpty()) {
            for (Long mentionedUserId : commentDto.getMentionedUserIds()) {
                try {
                    notificationService.createMentionNotification(
                        commentDto.getAuthorId(),
                        mentionedUserId,
                        savedComment.getId(),
                        commentDto.getContenu(),
                        commentDto.getTaskId()
                    );
                    log.info("Notification créée pour l'utilisateur {} mentionné dans le commentaire {}", 
                        mentionedUserId, savedComment.getId());
                } catch (Exception e) {
                    log.error("Erreur lors de la création de notification pour l'utilisateur {}: {}", 
                        mentionedUserId, e.getMessage());
                }
            }
        }
        
        return toDto(savedComment);
    }

    @Transactional
    public CommentDto update(Long id, CommentDto commentDto) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Commentaire non trouvé avec ID: " + id));
        
        comment.setContenu(commentDto.getContenu());
        
        // Mise à jour des mentions
        if (commentDto.getMentionedUserIds() != null) {
            log.info("Mise à jour des mentions utilisateurs pour le commentaire {}: {}", 
                id, commentDto.getMentionedUserIds());
                
            Set<User> mentionedUsers = commentDto.getMentionedUserIds().stream()
                    .map(userId -> userRepository.findById(userId)
                            .orElseThrow(() -> new EntityNotFoundException("Utilisateur mentionné non trouvé avec ID: " + userId)))
                    .collect(Collectors.toSet());
            comment.setMentionedUsers(mentionedUsers);
        }
        
        if (commentDto.getMentionedClientIds() != null) {
            log.info("Mise à jour des mentions clients pour le commentaire {}: {}", 
                id, commentDto.getMentionedClientIds());
                
            Set<Client> mentionedClients = commentDto.getMentionedClientIds().stream()
                    .map(clientId -> clientRepository.findById(clientId)
                            .orElseThrow(() -> new EntityNotFoundException("Client mentionné non trouvé avec ID: " + clientId)))
                    .collect(Collectors.toSet());
            comment.setMentionedClients(mentionedClients);
        }
        
        Comment updatedComment = commentRepository.save(comment);
        log.info("Commentaire mis à jour avec succès, ID: {}", updatedComment.getId());
        return toDto(updatedComment);
    }

    @Transactional
    public void delete(Long id) {
        commentRepository.deleteById(id);
    }

    public Optional<CommentDto> findById(Long id) {
        return commentRepository.findById(id).map(this::toDto);
    }

    public List<CommentDto> findAll() {
        return commentRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<CommentDto> findByTaskId(Long taskId) {
        return commentRepository.findByTaskId(taskId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<CommentDto> findByAuthorId(Long authorId) {
        return commentRepository.findByAuthorId(authorId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteByTaskId(Long taskId) {
        commentRepository.deleteByTaskId(taskId);
    }
} 