@echo off
REM Script para copiar la clave pública de ms-auth a ms-users (Windows)
REM Uso: setup-keys.bat (desde el directorio backend\)

echo 🔑 Copiando clave pública JWT de ms-auth a ms-users y ms-kpi...

REM Verificar que existe la clave pública en ms-auth
if not exist "ms-auth\keys\public.key" (
  echo ❌ Error: No se encontró ms-auth\keys\public.key
  echo    Ejecuta primero: cd ms-auth ^&^& node scripts\generate-keys.js
  exit /b 1
)

REM Crear directorio keys en ms-users si no existe
if not exist "ms-users\keys" mkdir ms-users\keys

REM Copiar clave pública
copy ms-auth\keys\public.key ms-users\keys\jwt_public.pem

if not exist "ms-kpi\keys" mkdir ms-kpi\keys
copy ms-auth\keys\public.key ms-kpi\keys\public.key

echo ✅ Clave pública copiada exitosamente a ms-users\keys\jwt_public.pem y ms-kpi\keys\public.key
echo.
echo Próximos pasos:
echo 1. Configurar DATABASE_URL_USERS en .env.docker
echo 2. Ejecutar: docker compose --env-file .env.docker up --build
echo 3. Verificar: curl http://localhost:8010/api/v1/users/health
