FROM node:20-alpine

# Install minimal system dependencies
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with better error handling
RUN echo "Installing npm dependencies..." && \
    npm install --verbose 2>&1 | tee /tmp/npm-install.log || \
    (echo "=== NPM INSTALL FAILED ===" && \
     echo "Package.json contents:" && cat package.json && \
     echo "NPM install log:" && cat /tmp/npm-install.log && \
     echo "Node version:" && node --version && \
     echo "NPM version:" && npm --version && \
     exit 1)

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN echo "Generating Prisma client..." && \
    npx prisma generate || \
    (echo "Prisma generate failed" && exit 1)

# Copy application code
COPY . .

# Build the application
RUN echo "Building Next.js application..." && \
    npm run build || \
    (echo "Build failed" && ls -la && exit 1)

# Create data directory structure with proper permissions
RUN mkdir -p /app/data/config && \
    mkdir -p /app/data/logs && \
    mkdir -p /app/data/temp && \
    mkdir -p /app/uploads/modules && \
    mkdir -p /app/uploads/themes && \
    mkdir -p /app/uploads/temp && \
    mkdir -p /app/modules && \
    mkdir -p /app/themes && \
    chown -R node:node /app

# Copy entrypoint script
COPY scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
