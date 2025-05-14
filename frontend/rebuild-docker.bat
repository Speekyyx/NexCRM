@echo off
echo Reconstruction de l'image Docker du frontend...

cd %~dp0
cd ..

echo Arret du conteneur existant...
docker-compose stop frontend

echo Suppression du conteneur existant...
docker-compose rm -f frontend

echo Construction de la nouvelle image...
docker-compose build frontend

echo Démarrage du nouveau conteneur...
docker-compose up -d frontend

echo Affichage des logs...
docker-compose logs -f frontend 