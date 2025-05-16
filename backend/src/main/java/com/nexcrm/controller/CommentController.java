package com.nexcrm.controller;

import com.nexcrm.dto.CommentDto;
import com.nexcrm.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentDto> createComment(@RequestBody CommentDto commentDto) {
        log.info("Requête de création d'un commentaire reçue: contenu={}, taskId={}", 
            commentDto.getContenu(), commentDto.getTaskId());
        log.info("Mentions dans la requête - utilisateurs: {}, clients: {}", 
            commentDto.getMentionedUserIds(), commentDto.getMentionedClientIds());
        
        try {
            CommentDto createdComment = commentService.create(commentDto);
            log.info("Commentaire créé avec succès, ID: {}, mentions utilisateurs: {}, mentions clients: {}", 
                createdComment.getId(), createdComment.getMentionedUserIds(), createdComment.getMentionedClientIds());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
        } catch (Exception e) {
            log.error("Erreur lors de la création du commentaire: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentDto> updateComment(@PathVariable Long id, @RequestBody CommentDto commentDto) {
        log.info("Requête de mise à jour du commentaire ID: {}", id);
        log.info("Mentions dans la mise à jour - utilisateurs: {}, clients: {}", 
            commentDto.getMentionedUserIds(), commentDto.getMentionedClientIds());
        return ResponseEntity.ok(commentService.update(id, commentDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        log.info("Requête de suppression du commentaire ID: {}", id);
        commentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentDto> getComment(@PathVariable Long id) {
        log.info("Requête pour obtenir le commentaire ID: {}", id);
        return commentService.findById(id)
                .map(comment -> {
                    log.info("Commentaire trouvé, mentions: utilisateurs={}, clients={}", 
                        comment.getMentionedUserIds(), comment.getMentionedClientIds());
                    return ResponseEntity.ok(comment);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<CommentDto>> getAllComments() {
        log.info("Requête pour obtenir tous les commentaires");
        List<CommentDto> comments = commentService.findAll();
        log.info("Nombre de commentaires trouvés: {}", comments.size());
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<CommentDto>> getCommentsByTask(@PathVariable Long taskId) {
        log.info("Requête pour obtenir les commentaires de la tâche ID: {}", taskId);
        List<CommentDto> comments = commentService.findByTaskId(taskId);
        log.info("Nombre de commentaires trouvés pour la tâche {}: {}", taskId, comments.size());
        
        // Vérifier les mentions dans chaque commentaire
        comments.forEach(comment -> {
            log.info("Commentaire ID: {} - Mentions utilisateurs: {}, Mentions clients: {}", 
                comment.getId(), comment.getMentionedUserIds(), comment.getMentionedClientIds());
            log.info("Noms mentionnés - Utilisateurs: {}, Clients: {}", 
                comment.getMentionedUsernames(), comment.getMentionedClientNames());
        });
        
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CommentDto>> getCommentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(commentService.findByAuthorId(userId));
    }

    @DeleteMapping("/task/{taskId}")
    public ResponseEntity<Void> deleteCommentsByTask(@PathVariable Long taskId) {
        commentService.deleteByTaskId(taskId);
        return ResponseEntity.noContent().build();
    }
} 