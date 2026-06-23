@echo off
setlocal
cd /d "%~dp0"

echo Levantando base de datos y microservicio ms-users...
docker compose up users-db users --build

if errorlevel 1 (
  echo.
  echo Ocurrio un error al levantar el stack.
  pause
)
