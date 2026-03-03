# Node.js asosida image
FROM node:18-alpine

# Ishchi papkasini sozlash
WORKDIR /app

# Package files nusxalash
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Backend paketlarini o'rnatish
WORKDIR /app/backend
RUN npm install --production

# Frontend fayllarini nusxalash
WORKDIR /app
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Port ochish
EXPOSE 5000 3000

# Environment
ENV NODE_ENV=production

# Startup script
CMD ["sh", "-c", "npm start --prefix backend & node frontend/server.js"]
