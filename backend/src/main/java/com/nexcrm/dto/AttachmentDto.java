package com.nexcrm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDto {
    private Long id;
    private String fileName;
    private String fileType;
    private String uniqueIdentifier;
    private Long fileSize;
    private Long taskId;
    private String taskTitle;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime uploadDateTime;
    private String downloadUrl;
} 