#!/bin/sh
set -e

echo "Starting ScanCore initialization..."

# Create required directory structure
echo "Creating directory structure..."
mkdir -p /app/data/{config,logs,temp}
mkdir -p /app/uploads/{modules,themes,temp}
mkdir -p /app/modules
mkdir -p /app/themes

# Set proper permissions
chown -R node:node /app/data /app/uploads /app/modules /app/themes

# Wait for database to be ready
echo "Waiting for database connection..."
until npx prisma db push --accept-data-loss 2>/dev/null; do
  echo "Database not ready, waiting 5 seconds..."
  sleep 5
done

echo "Database connected successfully"

# Run database migrations
echo "Running database migrations..."
npx prisma db push

# Check if this is first installation
echo "Checking installation status..."
ADMIN_COUNT=$(npx prisma db execute --stdin <<EOF 2>/dev/null || echo "0"
SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN';
EOF
)

if [ "$ADMIN_COUNT" = "0" ] || [ -z "$ADMIN_COUNT" ]; then
  echo "First installation detected - installer will be available"
  export FIRST_INSTALL=true
else
  echo "Existing installation detected"
  export FIRST_INSTALL=false
fi

echo "Starting application..."
exec "$@"
