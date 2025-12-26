#!/bin/sh
set -e

echo "🚀 Starting Nomadigma..."
echo "Environment: ${NODE_ENV:-development}"

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set!"
  exit 1
fi

# Solo ejecutar migraciones en producción
if [ "$NODE_ENV" = "production" ]; then
  echo "📦 Running Prisma migrations..."
  
  # Ejecutar migraciones (Prisma maneja locks internamente)
  npx prisma migrate deploy --skip-generate
  
  MIGRATION_STATUS=$?
  
  if [ $MIGRATION_STATUS -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
  else
    echo "❌ Migration failed! Exit code: $MIGRATION_STATUS"
    exit 1
  fi
else
  echo "⏭️  Skipping migrations in non-production environment"
fi

echo "🌐 Starting Next.js server..."
# Iniciar el servidor
exec node server.js

