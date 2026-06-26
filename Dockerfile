# Multi-stage build for production-ready full-stack Applet
# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for compiling)
RUN npm ci

# Copy application source code
COPY . .

# Compile static assets + bundling server.ts into dist/server.cjs
RUN npm run build \
    && rm -rf node_modules \
    && npm ci --only=production

# Stage 2: Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set correct environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy output files and only production dependencies from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Keep our local storage fallback state file if it's there
COPY --from=builder /app/loans_db_state.json ./loans_db_state.json

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
