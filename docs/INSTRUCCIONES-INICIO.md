# Guia de inicio - InnovaTech (full stack)

Instrucciones para levantar el proyecto completo: frontend React, API Gateway KrakenD, BFF y microservicios backend con PostgreSQL.

---

## Resumen del sistema

InnovaTech es una plataforma de gestion de proyectos y tareas con autenticacion JWT (RS256), roles RBAC y arquitectura de microservicios.

| Componente | Rol |
|------------|-----|
| **Frontend** | React 18 + Vite (`:5173`) |
| **KrakenD** | API Gateway, CORS, validacion JWT, RBAC (`:8010`) |
| **BFF** | Orquestacion y contrato orientado al frontend (`:3010`, interno) |
| **ms-auth** | Login, registro, JWT, JWKS, logout (`:3001`, interno) |
| **ms-users** | Usuarios, perfiles, endpoints internos (`:3003`, interno) |
| **ms-project-manager** | Proyectos, tareas, KPIs, colaboracion (`:3002`, interno) |
| **PostgreSQL** | `users-db` (:5433) y `pm-db` (:5434) |

**Entrada unica para el cliente:** `http://localhost:8010/api/v1/`

El frontend no debe llamar directamente a los microservicios internos.

Documentacion tecnica del backend: [backend/README.md](../backend/README.md)

---

## Requisitos

- Node.js 20 o superior
- npm
- Docker Desktop (recomendado para levantar todo el backend)
- Git

Opcional para desarrollo manual sin Docker: PostgreSQL local o Neon Cloud.

---

## Opcion recomendada: Docker Compose + Frontend

### 1. Claves RSA (solo la primera vez)

```powershell
cd backend\ms-auth
node .\scripts\generate-keys.js
cd ..
```

Genera `keys/private.key` (ms-auth firma JWT) y `keys/public.key` (verificacion en gateway y servicios).

### 2. Variables de entorno Docker

```powershell
cd backend
copy .env.docker.example .env.docker
```

En desarrollo local el compose usa PostgreSQL embebido (`users-db`, `pm-db`). Las variables `DATABASE_URL_*` en `.env.docker` son opcionales salvo que apuntes a Neon u otra BD externa.

### 3. Levantar backend completo

```powershell
cd backend
docker compose --env-file .env.docker up -d --build
```

Servicios incluidos: KrakenD, BFF, ms-auth, ms-users, ms-project-manager, ambas bases PostgreSQL y Prometheus.

### 4. Verificar backend

| Recurso | URL |
|---------|-----|
| API (KrakenD) | http://localhost:8010/api/v1/ |
| JWKS | http://localhost:8010/.well-known/jwks.json |
| PostgreSQL users | localhost:5433 (base `innovatech_users`) |
| PostgreSQL PM | localhost:5434 (base `innovatech_pm`) |
| Prometheus | http://localhost:9090 |

Comprobacion rapida en PowerShell:

```powershell
@(
  "8010/.well-known/jwks.json",
  "8010/api/v1/auth/health"
) | ForEach-Object {
  try {
    $r = Invoke-WebRequest -UseBasicParsing "http://localhost:$_" -TimeoutSec 5
    Write-Host "OK $_ : $($r.StatusCode)"
  } catch {
    Write-Host "FAIL $_ : no responde"
  }
}
```

### 5. Levantar frontend

En otra terminal, desde la raiz del repositorio:

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Abrir http://localhost:5173

Vite hace proxy de `/api` hacia `http://localhost:8010`, por lo que el frontend usa `/api/v1` sin configurar CORS manualmente.

### 6. Usuarios de prueba (seed local)

Password para todos: `Secret123`

| Email | Rol |
|-------|-----|
| gestor@innovatech.cl | gestor |
| profesional@innovatech.cl | profesional |
| directivo@innovatech.cl | directivo |

### Comandos utiles Docker

```powershell
cd backend

# Logs
docker compose logs -f api-gateway bff auth users project-manager

# Reconstruir un servicio
docker compose up -d --build auth

# Detener todo
docker compose down
```

---

## Opcion alternativa: desarrollo manual (sin Docker)

Util cuando quieres depurar un solo microservicio. Necesitas PostgreSQL accesible y las claves RSA generadas.

Abre una terminal por servicio (orden sugerido: ms-users, ms-auth, ms-project-manager, BFF). KrakenD en manual es mas complejo; para flujo completo usa Docker.

### ms-users (puerto 3003)

```powershell
cd backend\ms-users
npm install
npm run dev
```

Health: http://localhost:3003/health  
Swagger: http://localhost:3003/api-docs

### ms-auth (puerto 3001)

```powershell
cd backend\ms-auth
npm install
npm run dev
```

Health: http://localhost:3001/api/auth/health  
Swagger: http://localhost:3001/api-docs

Variable clave: `USERS_SERVICE_URL=http://localhost:3003`

### ms-project-manager (puerto 3002)

```powershell
cd backend\ms-project-manager
npm install
npm run dev
```

Health: http://localhost:3002/health  
Swagger: http://localhost:3002/api-docs

### BFF (puerto 3010)

```powershell
cd backend\bff
npm install
npm run dev
```

Health: http://localhost:3010/health  
Swagger: http://localhost:3010/api-docs

Sin KrakenD, el frontend debe apuntar a URLs directas o levantar el gateway por separado.

### Verificacion manual

```powershell
@(
  "3001/api/auth/health",
  "3003/health",
  "3002/health",
  "3010/health"
) | ForEach-Object {
  try {
    $r = Invoke-WebRequest -UseBasicParsing "http://localhost:$_" -TimeoutSec 2
    Write-Host "OK $_ : $($r.StatusCode)"
  } catch {
    Write-Host "FAIL $_ : no responde"
  }
}
```

---

## Instalacion de dependencias (primera vez)

```powershell
cd backend\ms-auth && npm install
cd ..\ms-users && npm install
cd ..\ms-project-manager && npm install
cd ..\bff && npm install
cd ..\..\frontend && npm install
```

---

## Swagger (documentacion interactiva)

Cada servicio expone OpenAPI en `/api-docs`:

| Servicio | Swagger UI |
|----------|------------|
| ms-auth | http://localhost:3001/api-docs |
| ms-users | http://localhost:3003/api-docs |
| ms-project-manager | http://localhost:3002/api-docs |
| BFF | http://localhost:3010/api-docs |

### Probar login y token JWT

1. Ir a Swagger de ms-auth o usar la API publica via KrakenD: `POST http://localhost:8010/api/v1/auth/login`
2. Body de ejemplo:

```json
{
  "email": "gestor@innovatech.cl",
  "password": "Secret123"
}
```

3. Copiar el token de la respuesta.
4. En Swagger, pulsar **Authorize** e ingresar: `Bearer <token>`
5. Probar rutas protegidas en ms-project-manager o via gateway (`GET /api/v1/projects`).

En produccion con KrakenD, la validacion JWT la hace el gateway consultando JWKS de ms-auth; el BFF recibe headers `X-User-Id`, `X-User-Email`, `X-User-Role`.

---

## Tests

El proyecto incluye pruebas unitarias e integracion con umbral minimo del 60% de cobertura en lineas/statements.

### Backend (Jest + Supertest, ESM)

```powershell
cd backend\ms-auth && npm test
cd ..\ms-users && npm test
cd ..\ms-project-manager && npm test
cd ..\bff && npm test
```

Script agrupado (auth, PM, BFF):

```powershell
cd backend
npm test
```

### Frontend (Vitest + Testing Library)

```powershell
cd frontend
npm test
npm run test:coverage
```

---

## Arquitectura

```
Frontend (React/Vite :5173)
        |
        v
KrakenD API Gateway (:8010)
  - JWT RS256 (JWKS ms-auth)
  - CORS, RBAC
        |
        v
BFF (:3010, interno)
  - Orquestacion
  - Rutas /proyectos agregadas
        |
        +-- ms-auth (:3001) ----HTTP interno----> ms-users (:3003) --> PostgreSQL users-db
        |
        +-- ms-project-manager (:3002) ---------> PostgreSQL pm-db
```

### Database per Service

- **ms-users** persiste la tabla `usuarios` en `innovatech_users` (puerto host 5433).
- **ms-project-manager** persiste proyectos y tareas en `innovatech_pm` (puerto host 5434).
- **ms-auth** no es dueno de datos de usuario; delega login/registro en ms-users via REST interno con `X-Internal-Token`.

Schemas:

- `backend/ms-users/database/schema.sql`
- `backend/ms-project-manager/db/migrations/`

### Flujo de autenticacion (resumen)

1. Cliente: `POST /api/v1/auth/login` (KrakenD, ruta publica).
2. KrakenD reenvia al BFF, BFF reenvia a ms-auth.
3. ms-auth consulta ms-users (`/api/users/internal/by-email/:email`).
4. ms-auth verifica password (bcrypt) y firma JWT RS256.
5. Cliente envia `Authorization: Bearer <token>` en rutas protegidas.
6. KrakenD valida JWT con `/.well-known/jwks.json` e inyecta headers de identidad.

### Patrones de codigo

- Controller delgado, Service (negocio), Repository (SQL), DTO (validacion).
- Backend en ES Modules (`"type": "module"`).
- Comunicacion entre servicios: REST + JSON.

---

## Estructura del repositorio

```
InnovaTech/
├── README.md                  Guia central del proyecto
├── frontend/                  React + Vite + TypeScript + Vitest
├── backend/
│   ├── README.md              Documentacion backend detallada
│   ├── docker-compose.yml
│   ├── scripts/               Smoke E2E y utilidades
│   ├── api-gateway/           KrakenD (krakend.json)
│   ├── bff/
│   ├── ms-auth/
│   ├── ms-users/
│   ├── ms-project-manager/
│   └── k8s/                   Manifiestos Kubernetes
└── docs/
    ├── INSTRUCCIONES-INICIO.md (este archivo)
    └── diagramas/             Fuentes C1 / C2 / C3
```

---

## Solucion de problemas

### Puerto en uso (EADDRINUSE)

```powershell
netstat -ano | findstr :3001
Stop-Process -Id <PID> -Force
```

O detener procesos Node:

```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### KrakenD o BFF no responde

```powershell
cd backend
docker compose ps
docker compose logs api-gateway bff
```

### Error de base de datos

1. Verificar que contenedores `users-db` y `pm-db` esten running.
2. Revisar `DATABASE_URL` en logs de ms-users / ms-project-manager.
3. Si usas Neon, comprobar conectividad y `sslmode` en la URL.

### JWT invalido o expirado

1. Volver a hacer login.
2. Verificar que existan las claves en `backend/ms-auth/keys/`.
3. Comprobar JWKS: http://localhost:8010/.well-known/jwks.json

### Swagger sin endpoints

Revisar que las rutas tengan anotaciones `@openapi` y que la app monte `/api-docs`.

### Frontend no conecta al backend

1. Confirmar Docker en `:8010`.
2. Revisar `frontend/.env` (`VITE_API_BASE_URL=/api/v1` o URL completa).
3. Confirmar proxy en `frontend/vite.config.ts`.

---

## Kubernetes (opcional)

Para despliegue en cluster, ver [backend/k8s/README.md](../backend/k8s/README.md).

Resumen:

```powershell
cd backend\ms-auth
node scripts\generate-keys.js

kubectl create secret generic innovatech-jwt-keys -n innovatech `
  --from-file=private.key=ms-auth/keys/private.key `
  --from-file=public.key=ms-auth/keys/public.key

kubectl apply -k k8s/
```

Acceso local al gateway en cluster:

```powershell
kubectl port-forward -n innovatech svc/api-gateway 8010:8080
```

---

## Tecnologias

| Area | Stack |
|------|-------|
| Frontend | React 18, Vite 5, React Router, Vitest |
| Backend | Node.js 20+, TypeScript, Express, ES Modules |
| Gateway | KrakenD 2.7 |
| BD | PostgreSQL 16 |
| Auth | JWT RS256, bcrypt, JWKS |
| Docs API | swagger-jsdoc, swagger-ui-express |
| Contenedores | Docker Compose |
| Tests backend | Jest, Supertest |
| Observabilidad | Prometheus (compose local) |

---

## Recursos

- Guia central: [README.md](../README.md)
- Backend detallado: [backend/README.md](../backend/README.md)
- Kubernetes: [backend/k8s/README.md](../backend/k8s/README.md)
- Swagger/OpenAPI: https://swagger.io/docs/
- JWT: https://jwt.io/introduction

---

## Soporte rapido

1. Revisar logs: `docker compose logs -f <servicio>`
2. Verificar health de cada capa (gateway, BFF, microservicios).
3. Confirmar claves RSA y usuarios seed.
4. Ejecutar tests: `npm test` en backend y frontend.

---

InnovaTech - stack completo: frontend, gateway KrakenD, BFF, microservicios, PostgreSQL y pruebas automatizadas.
