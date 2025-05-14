#!/bin/bash

echo "NexCRM Backend - Démarrage avec Docker"
echo "======================================"

# Se positionner dans le répertoire du script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "Construction et démarrage des conteneurs..."
docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo "Erreur lors du démarrage des conteneurs Docker!"
    exit 1
fi

echo "Les conteneurs sont en cours d'exécution."
echo "Pour arrêter, utilisez 'docker-compose down'"
echo "Pour voir les logs: 'docker-compose logs -f'"
echo "======================================" 