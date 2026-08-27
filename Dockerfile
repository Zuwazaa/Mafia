# Production Dockerfile for Mafia Online Web App
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (clean install)
RUN npm install

# Copy application source
COPY . .

# Build Vite frontend & bundle Express backend
RUN npm run build

# Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package definitions
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy build artifacts from builder
COPY --from=builder /app/dist ./dist

# Expose port (Railway/Render will inject $PORT)
EXPOSE 3000

CMD ["node", "dist/server.cjs"]
