package com.nexcrm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationDto {
    private Long id;
    private String message;
    private String type;
    private Long recipientId;
    private String recipientUsername;
    private Long senderId;
    private String senderUsername;
    private Long entityId;
    private String entityType;
    private boolean read;
    private LocalDateTime creationDate;
} 