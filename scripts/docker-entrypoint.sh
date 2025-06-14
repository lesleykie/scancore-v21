#!/bin/sh
set -e

echo "=== ScanCore Initialization ==="

# Create directory structure explicitly (no brace expansion)
echo "Creating directory structure..."
mkdir -p /app/data/config
mkdir -p /app/data/logs  
mkdir -p /app/data/temp
mkdir -p /app/uploads/modules
mkdir -p /app/uploads/themes
mkdir -p /app/uploads/temp
mkdir -p /app/modules
mkdir -p /app/themes

echo "✓ Directory structure created"

# Test write permissions
echo "Testing write permissions..."
touch /app/data/test-write 2>/dev/null || (echo "ERROR: Cannot write to /app/data" && exit 1)
rm -f /app/data/test-write
echo "✓ Write permissions OK"

# Wait for database to be ready
echo "Waiting for database connection..."
MAX_RETRIES=30
RETRY_COUNT=0

until npx prisma db push --accept-data-loss 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "ERROR: Database connection failed after $MAX_RETRIES attempts"
    echo "Database URL: $DATABASE_URL"
    exit 1
  fi
  echo "Database not ready (attempt $RETRY_COUNT/$MAX_RETRIES), waiting 5 seconds..."
  sleep 5
done

echo "✓ Database connected successfully"

# Run database migrations
echo "Running database migrations..."
if ! npx prisma db push; then
  echo "ERROR: Database migration failed"
  exit 1
fi

echo "✓ Database migrations completed"

# Check installation status
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
echo "App URL: $NEXTAUTH_URL"
echo "=========================="

exec "$@"
