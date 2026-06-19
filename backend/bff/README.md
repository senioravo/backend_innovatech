# BFF (Backend for Frontend) — InnovaTech

## Technical specification

| Aspect | Detail |
|--------|--------|
| **Language** | TypeScript (Node.js 20+) |
| **Framework** | Express.js 4.18 |
| **Libraries** | cors, dotenv, express, jsonwebtoken, swagger-jsdoc, swagger-ui-express |
| **Design patterns** | BFF, layered architecture (presentation / application / infrastructure), orchestration, RBAC middleware, response transformers |
| **Database** | None (stateless; delegates persistence to microservices) |
| **Testing** | Jest 29 + Supertest 7 + ts-jest |

## Descripción

Capa de orquestación entre el frontend y los microservicios internos (`ms-auth`, `ms-project-manager`). Adapta respuestas al contrato del cliente (campos en inglés, agregación de proyectos/tareas/KPIs) sin duplicar lógica de dominio.

## Ejecución

### Requisitos

- Node.js 20+
- Microservicios `ms-auth` (:3001) y `ms-project-manager` (:3002) en ejecución, o stack Docker Compose completo

### Instalación y desarrollo local

```bash
cd backend/bff
npm install
cp .env.example .env
npm run dev
```

El servicio queda en `http://localhost:3010` bajo el prefijo `/api/v1`.

### Producción

```bash
npm run build
npm start
```

### Docker Compose (recomendado)

Desde `backend/`:

```bash
docker compose --env-file .env.docker up -d --build bff
```

El BFF es interno; el frontend accede vía KrakenD en `http://localhost:8010/api/v1/`.

### Tests

```bash
npm test
npm run test:coverage
```

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto HTTP | `3010` |
| `JWT_SECRET` | Secreto para validar JWT en el BFF | — |
| `API_GATEWAY_PREFIX` | Prefijo de rutas | `/api/v1` |
| `AUTH_SERVICE_BASE_URL` | URL base de ms-auth | `http://localhost:3001` |
| `PROJECT_MANAGER_BASE_URL` | URL base de ms-project-manager | `http://localhost:3002` |

## Documentación relacionada

- [Backend general](../README.md)
- [Manifiestos Kubernetes](./k8s/README.md)
