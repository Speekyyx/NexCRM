package com.nexcrm.controller;

import com.nexcrm.dto.AttachmentDto;
import com.nexcrm.dto.UserDto;
import com.nexcrm.exception.ResourceNotFoundException;
import com.nexcrm.service.AttachmentService;
import com.nexcrm.service.FileStorageService;
import com.nexcrm.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Enumeration;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin(origins = "*")
@Slf4j
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final FileStorageService fileStorageService;
    private final UserService userService;

    @Autowired
    public AttachmentController(
            AttachmentService attachmentService, 
            FileStorageService fileStorageService,
            UserService userService) {
        this.attachmentService = attachmentService;
        this.fileStorageService = fileStorageService;
        this.userService = userService;
    }

    @PostMapping("/upload")
    public ResponseEntity<AttachmentDto> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam("taskId") Long taskId,
            @RequestParam(value = "userId", required = false) Long userId,
            HttpServletRequest request) {
        
        // Journaliser les en-têtes de la requête pour débogage
        logRequestHeaders(request);
        
        // Obtenir l'utilisateur actuellement authentifié
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        log.info("Upload de fichier: authentification username={}, authenticated={}, authorities={}", 
                 username, authentication.isAuthenticated(), authentication.getAuthorities());
        
        Long uploaderId;
        
        // Si l'utilisateur est anonyme, utiliser l'userId fourni en paramètre
        if ("anonymousUser".equals(username)) {
            log.info("Utilisation d'un utilisateur anonyme, recherche de l'userId dans les paramètres: {}", userId);
            
            if (userId == null) {
                // Si aucun userId n'est fourni, utiliser l'utilisateur admin par défaut
                log.info("Aucun userId fourni, recherche de l'utilisateur admin par défaut");
                Optional<UserDto> adminUser = userService.findByUsername("admin");
                if (adminUser.isPresent()) {
                    uploaderId = adminUser.get().getId();
                    log.info("Utilisateur admin trouvé, id={}", uploaderId);
                } else {
                    // Fallback au premier utilisateur trouvé
                    log.info("Utilisateur admin non trouvé, recherche du premier utilisateur disponible");
                    List<UserDto> users = userService.findAll();
                    if (users.isEmpty()) {
                        log.error("Aucun utilisateur trouvé dans la base de données");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(null);
                    }
                    uploaderId = users.get(0).getId();
                    log.info("Premier utilisateur trouvé, id={}", uploaderId);
                }
            } else {
                uploaderId = userId;
                log.info("Utilisateur fourni dans les paramètres, id={}", uploaderId);
            }
        } else {
            // Sinon, récupérer l'utilisateur à partir du username
            log.info("Utilisateur authentifié: {}", username);
            UserDto user = userService.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec le nom: " + username));
            uploaderId = user.getId();
            log.info("ID de l'utilisateur récupéré: {}", uploaderId);
        }
        
        AttachmentDto uploadedAttachment = attachmentService.uploadAttachment(taskId, uploaderId, file);
        log.info("Fichier téléchargé avec succès, id={}", uploadedAttachment.getId());
        
        return ResponseEntity.created(
                ServletUriComponentsBuilder.fromCurrentRequest()
                        .path("/{id}")
                        .buildAndExpand(uploadedAttachment.getId())
                        .toUri())
                .body(uploadedAttachment);
    }
    
    // Méthode utilitaire pour journaliser tous les en-têtes de la requête
    private void logRequestHeaders(HttpServletRequest request) {
        log.info("En-têtes de la requête:");
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);
            if ("authorization".equalsIgnoreCase(headerName)) {
                log.info("  {} : {}", headerName, headerValue != null ? "PRÉSENT (masqué)" : "ABSENT");
            } else {
                log.info("  {} : {}", headerName, headerValue);
            }
        }
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<AttachmentDto>> getAttachmentsByTaskId(@PathVariable Long taskId) {
        List<AttachmentDto> attachments = attachmentService.getAttachmentsByTaskId(taskId);
        return ResponseEntity.ok(attachments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttachmentDto> getAttachmentById(@PathVariable Long id) {
        AttachmentDto attachment = attachmentService.getAttachmentById(id);
        return ResponseEntity.ok(attachment);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long id,
            @RequestParam(name = "token", required = false) String token) {
        
        // Le paramètre token est ignoré ici car Spring Security gère l'authentification
        // mais nous le prenons en compte pour la compatibilité avec le frontend
        
        // Récupérer les informations sur la pièce jointe
        AttachmentDto attachment = attachmentService.getAttachmentById(id);
        
        // Charger le fichier comme une ressource
        Resource resource = fileStorageService.loadFileAsResource(
                attachment.getUniqueIdentifier(), attachment.getTaskId());
        
        // Déterminer le type de contenu
        String contentType = attachment.getFileType();
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + attachment.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.noContent().build();
    }
} 