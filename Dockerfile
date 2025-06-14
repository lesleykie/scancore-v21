FROM node:20-alpine

# Install system dependencies for barcode scanning and image processing
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with error handling
RUN echo "Installing npm dependencies..." && \
    npm install --verbose || (echo "NPM install failed. Package.json contents:" && cat package.json && exit 1)

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client with error handling
RUN echo "Generating Prisma client..." && \
    npx prisma generate || (echo "Prisma generate failed" && exit 1)

# Copy application code
COPY . .

# Build the application with error handling
RUN echo "Building Next.js application..." && \
    npm run build || (echo "Build failed. Checking for errors..." && ls -la && exit 1)

# Create data directory and set permissions
RUN mkdir -p /app/data && \
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
