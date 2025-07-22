# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-slim AS production
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/entrypoint.sh ./
COPY --from=builder /app/prisma ./prisma
RUN chmod +x entrypoint.sh
RUN npm ci --only=production
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"] 