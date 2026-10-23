# Single-service image: Express serves the API and the built React app from one origin.
FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
# VITE_API_URL is left unset, so the frontend calls /api on the same origin
RUN npm run build

FROM node:22-alpine AS backend-build
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY --from=backend-build /app/dist ./dist
COPY --from=frontend-build /frontend/dist ./public

EXPOSE 3000
CMD ["npm", "start"]
