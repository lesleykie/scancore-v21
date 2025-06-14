#!/bin/sh
set -e

echo "=== ScanCore Initialization ==="

# Create required directory structure
echo "Creating directory structure..."
mkdir -p /app/data/{config,logs,temp}
mkdir -p /app/uploads/{modules,themes,temp}
mkdir -p /app/modules
mkdir -p /app/themes

# Set proper permissions
chown -R node:node /app/data /app/uploads /app/modules /app/themes

# Wait for database to be ready with better error handling
echo "Waiting for database connection..."
MAX_RETRIES=30
RETRY_COUNT=0

until npx prisma db push --accept-data-loss 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "ERROR: Database connection failed after $MAX_RETRIES attempts"
    echo "Database URL: $DATABASE_URL"
    echo "Checking database container status..."
    exit 1
  fi
  echo "Database not ready (attempt $RETRY_COUNT/$MAX_RETRIES), waiting 5 seconds..."
  sleep 5
done

echo "✓ Database connected successfully"

# Run database migrations with error handling
echo "Running database migrations..."
if ! npx prisma db push; then
  echo "ERROR: Database migration failed"
  echo "Prisma schema status:"
  npx prisma db pull --print || echo "Could not pull schema"
  exit 1
fi

echo "✓ Database migrations completed"

# Check if this is first installation
echo "Checking installation status..."
ADMIN_COUNT=$(npx prisma db execute --stdin <<EOF 2>/dev/null || echo "0"
SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN';
EOF
)

if [ "$ADMIN_COUNT" = "0" ] || [ -z "$ADMIN_COUNT" ]; then
  echo "✓ First installation detected - installer will be available"
  export FIRST_INSTALL=true
else
  echo "✓ Existing installation detected ($ADMIN_COUNT admin users)"
  export FIRST_INSTALL=false
fi

echo "=== Starting Application ==="
echo "Environment: $NODE_ENV"
echo "Database URL: ${DATABASE_URL%@*}@***"
echo "App URL: $NEXTAUTH_URL"
echo "Debug Mode: $DEBUG_MODE"
echo "=========================="

exec "$@"
