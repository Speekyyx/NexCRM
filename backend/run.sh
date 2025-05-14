#!/bin/bash

echo "NexCRM Backend - Démarrage"
echo "=============================="

# Se positionner dans le répertoire du script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "Compilation du projet..."
mvn clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "Erreur de compilation! Vérification des erreurs..."
    exit 1
fi

echo "Démarrage de l'application..."
java -jar target/nexcrm-0.0.1-SNAPSHOT.jar

echo "==============================" 