package com.nexcrm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommentDto {
    private Long id;
    private String contenu;
    private Long taskId;
    private Long authorId;
    private String authorUsername;
    private LocalDateTime dateCreation;
    private Set<Long> mentionedUserIds = new HashSet<>();
    private Set<Long> mentionedClientIds = new HashSet<>();
    private Set<String> mentionedUsernames = new HashSet<>();
    private Set<String> mentionedClientNames = new HashSet<>();
} 