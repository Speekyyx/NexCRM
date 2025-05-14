@echo off
echo NexCRM Backend - Demarrage avec Docker
echo ======================================

set SCRIPT_DIR=%~dp0
cd %SCRIPT_DIR%

echo Construction et demarrage des conteneurs...
docker-compose up -d --build

if %ERRORLEVEL% neq 0 (
    echo Erreur lors du demarrage des conteneurs Docker!
    exit /b %ERRORLEVEL%
)

echo Les conteneurs sont en cours d'execution.
echo Pour arreter, utilisez 'docker-compose down'
echo Pour voir les logs: 'docker-compose logs -f'
echo ====================================== 