# ── Stage 1 : Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Dépendances d'abord pour le cache
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Code source
COPY . .

# L'URL de l'API est injectée au moment du build via ARG → VITE_API_URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ── Stage 2 : Serve ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Config nginx pour le SPA React
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build produit
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
