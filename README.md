# NexCRM - Système de Gestion CRM

## Description
NexCRM est un système de gestion de la relation client (CRM) comprenant un gestionnaire de tâches robuste. Cette application permet de suivre et de gérer les tâches assignées aux développeurs pour différents clients, avec différents niveaux d'accès utilisateur.

## Structure du Projet

Le projet est organisé en modules séparés :

- **`/backend`** : Contient toutes les ressources liées au backend développé en Java/Spring Boot
  - Voir le [README du backend](backend/README.md) pour plus de détails

## Fonctionnalités principales

- **Gestion des utilisateurs** : Différents rôles (Développeur, Chef de projet, Client)
- **Gestion des tâches** : Création, modification, suppression et suivi des tâches
- **Assignation des tâches** : Attribution des tâches aux développeurs
- **Suivi de statut** : Statuts des tâches (À faire, En cours, Terminée)
- **Gestion des priorités** : Définition des priorités des tâches (Basse, Moyenne, Haute)
- **Sécurité** : Authentification JWT et contrôle d'accès basé sur les rôles

## Technologies utilisées

### Backend
- Java 17
- Spring Boot 3.1.5
- Spring Security avec JWT
- Spring Data JPA
- PostgreSQL

### Déploiement
- Docker et Docker Compose
- Maven

## Démarrage rapide

### Backend

Pour exécuter le backend en local :

```bash
# Sous Windows
cd backend
.\run.bat

# Sous Linux/Mac
cd backend
./run.sh
```

Pour exécuter avec Docker :

```bash
# Sous Windows
cd backend
.\docker-run.bat

# Sous Linux/Mac
cd backend
./docker-run.sh
```

Pour plus de détails, consultez le [README du backend](backend/README.md).

## Licence
Ce projet est sous licence MIT. 