# Multi-stage Docker build for production

# Stage 1: Development dependencies for building
FROM node:20-alpine AS development-dependencies-env
COPY package*.json /app/
WORKDIR /app
RUN npm ci --include=dev

# Stage 2: Production dependencies
FROM node:20-alpine AS production-dependencies-env
COPY package*.json /app/
WORKDIR /app
RUN npm ci --omit=dev && npm cache clean --force

# Stage 3: Build the application
FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build && \
    npm run typecheck

# Stage 4: Production runtime
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reactapp -u 1001

# Copy application files
COPY --from=production-dependencies-env --chown=reactapp:nodejs /app/node_modules /app/node_modules
COPY --from=build-env --chown=reactapp:nodejs /app/build /app/build
COPY --chown=reactapp:nodejs package*.json /app/

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Use non-root user
USER reactapp

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]