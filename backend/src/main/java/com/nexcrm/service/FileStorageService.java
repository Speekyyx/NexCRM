package com.nexcrm.service;

import com.nexcrm.config.FileStorageProperties;
import com.nexcrm.exception.FileStorageException;
import com.nexcrm.exception.FileNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    @Autowired
    public FileStorageService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Impossible de créer le répertoire où les fichiers seront stockés.", ex);
        }
    }

    public String storeFile(MultipartFile file, Long taskId) {
        // Normaliser le nom du fichier
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        // Générer un ID unique pour éviter les collisions
        String uniqueID = UUID.randomUUID().toString();
        
        // Créer une structure de répertoires pour les tâches
        Path taskDir = this.fileStorageLocation.resolve(String.valueOf(taskId));
        try {
            Files.createDirectories(taskDir);
        } catch (Exception ex) {
            throw new FileStorageException("Impossible de créer le répertoire pour la tâche " + taskId, ex);
        }
        
        try {
            // Vérifier si le nom du fichier contient des caractères invalides
            if (originalFileName.contains("..")) {
                throw new FileStorageException("Désolé! Le nom du fichier contient un chemin invalide " + originalFileName);
            }

            // Créer le nom de fichier avec l'ID unique
            String fileExtension = "";
            int lastIndexOfDot = originalFileName.lastIndexOf('.');
            if (lastIndexOfDot > 0) {
                fileExtension = originalFileName.substring(lastIndexOfDot);
            }
            
            String fileName = uniqueID + fileExtension;
            
            // Copier le fichier vers l'emplacement cible
            Path targetLocation = taskDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return uniqueID;
        } catch (IOException ex) {
            throw new FileStorageException("Impossible de stocker le fichier " + originalFileName + ". Veuillez réessayer!", ex);
        }
    }

    public Resource loadFileAsResource(String uniqueId, Long taskId) {
        try {
            Path taskDir = this.fileStorageLocation.resolve(String.valueOf(taskId));
            
            // Trouver le fichier par son ID unique
            Path filePath = null;
            try {
                filePath = Files.list(taskDir)
                    .filter(path -> path.getFileName().toString().startsWith(uniqueId))
                    .findFirst()
                    .orElseThrow(() -> new FileNotFoundException("Fichier introuvable avec l'ID: " + uniqueId));
            } catch (IOException ex) {
                throw new FileNotFoundException("Fichier introuvable avec l'ID: " + uniqueId);
            }
            
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new FileNotFoundException("Fichier introuvable avec l'ID: " + uniqueId);
            }
        } catch (MalformedURLException ex) {
            throw new FileNotFoundException("Fichier introuvable avec l'ID: " + uniqueId, ex);
        }
    }
    
    public boolean deleteFile(String uniqueId, Long taskId) {
        try {
            Path taskDir = this.fileStorageLocation.resolve(String.valueOf(taskId));
            
            // Trouver le fichier par son ID unique
            Path filePath = null;
            try {
                filePath = Files.list(taskDir)
                    .filter(path -> path.getFileName().toString().startsWith(uniqueId))
                    .findFirst()
                    .orElseThrow(() -> new FileNotFoundException("Fichier introuvable avec l'ID: " + uniqueId));
            } catch (IOException ex) {
                throw new FileNotFoundException("Fichier introuvable avec l'ID: " + uniqueId);
            }
            
            return Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new FileStorageException("Impossible de supprimer le fichier avec l'ID: " + uniqueId, ex);
        }
    }
} 