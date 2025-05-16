package com.nexcrm.service;

import com.nexcrm.dto.AttachmentDto;
import com.nexcrm.exception.ResourceNotFoundException;
import com.nexcrm.model.Attachment;
import com.nexcrm.model.Task;
import com.nexcrm.model.User;
import com.nexcrm.repository.AttachmentRepository;
import com.nexcrm.repository.TaskRepository;
import com.nexcrm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttachmentService {
    
    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public AttachmentService(
            AttachmentRepository attachmentRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            FileStorageService fileStorageService) {
        this.attachmentRepository = attachmentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public AttachmentDto uploadAttachment(Long taskId, Long userId, MultipartFile file) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable avec l'ID: " + taskId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'ID: " + userId));
        
        // Stocker le fichier et obtenir l'identifiant unique
        String uniqueFileId = fileStorageService.storeFile(file, taskId);
        
        // Créer une entité Attachment
        Attachment attachment = Attachment.builder()
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .filePath(taskId + "/" + uniqueFileId)
                .uniqueIdentifier(uniqueFileId)
                .fileSize(file.getSize())
                .task(task)
                .uploadedBy(user)
                .build();
        
        // Enregistrer l'entité Attachment
        Attachment savedAttachment = attachmentRepository.save(attachment);
        
        // Retourner le DTO
        return mapToDto(savedAttachment);
    }

    @Transactional(readOnly = true)
    public List<AttachmentDto> getAttachmentsByTaskId(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable avec l'ID: " + taskId));
        
        return attachmentRepository.findByTask(task).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AttachmentDto getAttachmentById(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Pièce jointe introuvable avec l'ID: " + attachmentId));
        
        return mapToDto(attachment);
    }

    @Transactional
    public void deleteAttachment(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Pièce jointe introuvable avec l'ID: " + attachmentId));
        
        // Supprimer le fichier physique
        fileStorageService.deleteFile(attachment.getUniqueIdentifier(), attachment.getTask().getId());
        
        // Supprimer l'enregistrement
        attachmentRepository.delete(attachment);
    }

    // Méthode utilitaire pour mapper un Attachment en AttachmentDto
    private AttachmentDto mapToDto(Attachment attachment) {
        String downloadUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/attachments/")
                .path(attachment.getId().toString())
                .path("/download")
                .toUriString();
        
        return AttachmentDto.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .fileType(attachment.getFileType())
                .uniqueIdentifier(attachment.getUniqueIdentifier())
                .fileSize(attachment.getFileSize())
                .taskId(attachment.getTask().getId())
                .taskTitle(attachment.getTask().getTitre())
                .uploadedById(attachment.getUploadedBy().getId())
                .uploadedByName(attachment.getUploadedBy().getPrenom() + " " + attachment.getUploadedBy().getNom())
                .uploadDateTime(attachment.getUploadDateTime())
                .downloadUrl(downloadUrl)
                .build();
    }
} 