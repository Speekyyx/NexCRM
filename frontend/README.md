# NexCRM Frontend

Ce dossier contient le code source du frontend pour l'application NexCRM.

## Technologies utilisées

- React 18
- Vite
- Styled Components
- Framer Motion (animations)
- Axios (requêtes HTTP)
- React Router DOM

## Structure du projet

```
frontend/
├── public/         - Fichiers statiques
├── src/
│   ├── components/ - Composants réutilisables
│   ├── pages/      - Pages de l'application
│   ├── services/   - Services d'API
│   ├── styles/     - Styles globaux et thème
│   ├── App.jsx     - Composant principal
│   └── main.jsx    - Point d'entrée
├── Dockerfile      - Configuration Docker
├── package.json    - Dépendances
└── vite.config.js  - Configuration Vite
```

## Fonctionnalités

- Tableau de bord intuitif avec statistiques
- Gestion des tâches (création, modification, suppression)
- Filtrage des tâches par statut et priorité
- Interface utilisateur moderne et animations fluides
- Thème sombre avec couleurs chaudes
- Responsive design
- Authentification JWT

## Installation et démarrage

### Prérequis

- Node.js >= 16
- npm ou yarn

### Développement local

1. Installez les dépendances :

```bash
npm install
# ou
yarn install
```

2. Démarrez le serveur de développement :

```bash
npm run dev
# ou
yarn dev
```

Le serveur de développement sera accessible à l'adresse `http://localhost:3000`.

### Production

Pour créer une version de production :

```bash
npm run build
# ou
yarn build
```

Les fichiers de production seront générés dans le répertoire `dist/`.

## Docker

Pour exécuter l'application via Docker :

```bash
# Construire l'image
docker build -t nexcrm-frontend .

# Exécuter le conteneur
docker run -p 3000:3000 nexcrm-frontend
```

## Utilisation avec le backend

Le frontend est configuré pour communiquer avec le backend NexCRM via le proxy configuré dans `vite.config.js`. Assurez-vous que le backend est en cours d'exécution sur le port 8080 pour un fonctionnement correct.

Pour une utilisation en production avec Docker Compose, utilisez le fichier docker-compose.yml à la racine du projet. 