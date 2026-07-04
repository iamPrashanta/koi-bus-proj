# Stage 1: Dependencies
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Development (Hot Reloading)
FROM node:22-slim AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Build for Production
FROM builder AS compiler
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 4: Production Runtime
FROM node:22-slim AS prod
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=compiler /app/dist ./dist
COPY --from=compiler /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
