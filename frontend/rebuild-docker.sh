#!/bin/bash
echo "Reconstruction de l'image Docker du frontend..."

# Se déplacer vers le dossier racine du projet
cd "$(dirname "$0")"
cd ..

echo "Arrêt du conteneur existant..."
docker-compose stop frontend

echo "Suppression du conteneur existant..."
docker-compose rm -f frontend

echo "Construction de la nouvelle image..."
docker-compose build frontend

echo "Démarrage du nouveau conteneur..."
docker-compose up -d frontend

echo "Affichage des logs..."
docker-compose logs -f frontend 