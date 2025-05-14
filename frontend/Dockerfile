# Image de base Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./

# Installer les dépendances avec des options pour contourner le bug des dépendances optionnelles
# --no-optional ignore les dépendances optionnelles
# --legacy-peer-deps : ignore les peerDependencies
# --platform=linux --arch=x64 : force la plateforme pour éviter les erreurs de plateformes
RUN npm install --no-optional --legacy-peer-deps --platform=linux --arch=x64 --omit=dev

# Copier le code source
COPY . .

# Construire l'application pour la production
RUN npm run dev

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"] 