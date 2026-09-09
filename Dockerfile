FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies (including devDependencies for build)
RUN npm ci
RUN cd client && npm ci

# Copy source
COPY . .

# Build client
RUN cd client && npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install python for sqlite3 bindings
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built client and server source
COPY --from=builder /app/client/build ./client/build
COPY src/ ./src/

# Create data directory
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/mangarr.db

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q --spider http://localhost:3000/api/health || exit 1

CMD ["node", "src/server.js"]
