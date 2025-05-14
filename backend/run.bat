@echo off
echo NexCRM Backend - Demarrage
echo ==============================

set SCRIPT_DIR=%~dp0

cd %SCRIPT_DIR%

echo Compilation du projet...
call mvn clean package -DskipTests

if %ERRORLEVEL% neq 0 (
    echo Erreur de compilation! Verification des erreurs...
    exit /b %ERRORLEVEL%
)

echo Demarrage de l'application...
java -jar target/nexcrm-0.0.1-SNAPSHOT.jar

echo ============================== 