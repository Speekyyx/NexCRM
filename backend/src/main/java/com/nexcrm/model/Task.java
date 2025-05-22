package com.nexcrm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"assignedUsers", "comments", "attachments"})
@EqualsAndHashCode(exclude = {"assignedUsers", "comments", "attachments"})
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(length = 1000)
    private String description;

    @Column(name = "date_echeance")
    private LocalDate dateEcheance;

    @Enumerated(EnumType.STRING)
    private Priority priorite;

    @Enumerated(EnumType.STRING)
    private Status statut;

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "task_assigned_users",
        joinColumns = @JoinColumn(name = "task_id", referencedColumnName = "id", foreignKey = @ForeignKey(name = "fk_task_users_task_id", foreignKeyDefinition = "FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE")),
        inverseJoinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id", foreignKey = @ForeignKey(name = "fk_task_users_user_id", foreignKeyDefinition = "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE"))
    )
    private Set<User> assignedUsers = new HashSet<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id")
    private Client client;

    @Column(precision = 10, scale = 2)
    private BigDecimal cout;

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "task_category",
        joinColumns = @JoinColumn(name = "task_id", referencedColumnName = "id",
            foreignKey = @ForeignKey(name = "fk_task_category_task_id", 
            foreignKeyDefinition = "FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE")),
        inverseJoinColumns = @JoinColumn(name = "category_id", referencedColumnName = "id",
            foreignKey = @ForeignKey(name = "fk_task_category_category_id", 
            foreignKeyDefinition = "FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE"))
    )
    private Set<Category> categories = new HashSet<>();

    @Column(name = "date_creation")
    private LocalDate dateCreation;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
    
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDate.now();
    }

    public enum Status {
        A_FAIRE,
        EN_COURS,
        TERMINEE
    }

    public enum Priority {
        BASSE,
        MOYENNE,
        HAUTE
    }
} 