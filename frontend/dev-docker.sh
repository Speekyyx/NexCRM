#!/bin/bash
echo "Démarrage de l'environnement de développement dans Docker..."

# Se déplacer vers le dossier courant
cd "$(dirname "$0")"

echo "Construction et démarrage du conteneur de développement..."
docker-compose -f docker-compose.dev.yml up --build -d

echo "Affichage des logs..."
docker-compose -f docker-compose.dev.yml logs -f frontend-dev 