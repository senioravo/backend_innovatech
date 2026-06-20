#!/bin/bash
# Script para copiar la clave pública de ms-auth a ms-users
# Uso: ./setup-keys.sh (desde el directorio backend/)

echo "🔑 Copiando clave pública JWT de ms-auth a ms-users y ms-kpi..."

# Verificar que existe la clave pública en ms-auth
if [ ! -f "ms-auth/keys/public.key" ]; then
  echo "❌ Error: No se encontró ms-auth/keys/public.key"
  echo "   Ejecuta primero: cd ms-auth && node scripts/generate-keys.js"
  exit 1
fi

# Crear directorios keys si no existen
mkdir -p ms-users/keys ms-kpi/keys

# Copiar clave pública
cp ms-auth/keys/public.key ms-users/keys/jwt_public.pem
cp ms-auth/keys/public.key ms-kpi/keys/public.key

echo "✅ Clave pública copiada a ms-users/keys/jwt_public.pem y ms-kpi/keys/public.key"
echo ""
echo "Próximos pasos:"
echo "1. Configurar DATABASE_URL_USERS en .env.docker"
echo "2. Ejecutar: docker compose --env-file .env.docker up --build"
echo "3. Verificar: curl http://localhost:8010/api/v1/users/health"
