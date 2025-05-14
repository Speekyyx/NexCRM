# NexCRM Backend

Ce dossier contient toutes les ressources liées au backend du projet NexCRM.

## Structure du projet

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/nexcrm/
│   │   │       ├── config/       - Configurations Spring Boot et sécurité
│   │   │       ├── controller/   - Contrôleurs REST API
│   │   │       ├── dto/          - Objets de transfert de données
│   │   │       ├── model/        - Entités JPA
│   │   │       ├── repository/   - Repositories Spring Data
│   │   │       ├── security/     - Configurations de sécurité JWT
│   │   │       ├── service/      - Services métier
│   │   │       └── NexCrmApplication.java - Point d'entrée de l'application
│   │   └── resources/
│   │       ├── application.yml      - Configuration principale
│   │       └── application-prod.yml - Configuration de production
│   └── test/
│       └── java/
│           └── com/nexcrm/     - Tests unitaires et d'intégration
├── Dockerfile            - Configuration Docker
├── docker-compose.yml    - Configuration Docker Compose
├── pom.xml               - Configuration Maven et dépendances
└── README.md             - Documentation
```

## Technologies utilisées

- Java 17
- Spring Boot 3.1.5
- Spring Security avec JWT
- Spring Data JPA
- PostgreSQL
- Docker & Docker Compose

## API REST disponibles

### Authentification
- `POST /api/auth/login` - Connexion utilisateur

### Utilisateurs
- `GET /api/users` - Récupérer tous les utilisateurs
- `GET /api/users/{id}` - Récupérer un utilisateur par ID
- `POST /api/users` - Créer un nouvel utilisateur (Chef de projet uniquement)
- `PUT /api/users/{id}` - Modifier un utilisateur (Chef de projet uniquement)
- `DELETE /api/users/{id}` - Supprimer un utilisateur (Chef de projet uniquement)

### Tâches
- `GET /api/tasks` - Récupérer toutes les tâches
- `GET /api/tasks/{id}` - Récupérer une tâche par ID
- `GET /api/tasks/user/{userId}` - Récupérer les tâches par utilisateur
- `GET /api/tasks/client/{clientId}` - Récupérer les tâches par client
- `GET /api/tasks/status/{status}` - Récupérer les tâches par statut
- `POST /api/tasks` - Créer une nouvelle tâche (Chef de projet uniquement)
- `PUT /api/tasks/{id}` - Modifier une tâche (Chef de projet uniquement)
- `DELETE /api/tasks/{id}` - Supprimer une tâche (Chef de projet uniquement)
- `PATCH /api/tasks/{id}/status/{status}` - Mettre à jour le statut d'une tâche
- `PATCH /api/tasks/{taskId}/assign/{userId}` - Assigner une tâche à un utilisateur (Chef de projet uniquement)

## Exécution en local

### Prérequis
- Java 17
- Maven
- PostgreSQL (ou utiliser Docker)

### Étapes
1. Compiler le projet : `mvn clean package`
2. Exécuter l'application : `java -jar target/nexcrm-0.0.1-SNAPSHOT.jar`

## Exécution avec Docker
1. Construire et démarrer les conteneurs : `docker-compose up -d`
2. Arrêter les conteneurs : `docker-compose down` 