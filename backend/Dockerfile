FROM maven:3.8.5-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
# Télécharge les dépendances Maven
RUN mvn dependency:go-offline
COPY src ./src
# Compile et empaquette l'application
RUN mvn package -DskipTests

FROM openjdk:17-slim
WORKDIR /app
# Copie le JAR compilé depuis l'étape de build
COPY --from=build /app/target/*.jar app.jar
# Expose le port utilisé par l'application
EXPOSE 8080
# Définie les variables d'environnement 
ENV SPRING_PROFILES_ACTIVE=prod
# Commande d'exécution
ENTRYPOINT ["java", "-jar", "app.jar"] 