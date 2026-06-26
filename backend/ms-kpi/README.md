# Microservicio KPI — InnovaTech

## Especificación técnica

| Aspecto | Detalle |
|---------|---------|
| **Lenguaje** | TypeScript (Node.js 20+) |
| **Framework** | Express.js 4.18 |
| **Librerías** | cors, dotenv, express, jsonwebtoken, swagger-jsdoc, swagger-ui-express |
| **Patrones de diseño** | Capa de aplicación, cliente HTTP upstream, circuit breaker, RBAC por headers `X-User-*` |
| **Base de datos** | Ninguna (sin estado; agrega datos consultando ms-project-manager) |
| **Pruebas** | Jest 29 + Supertest 7 + ts-jest |

## Descripción

Microservicio dedicado al **cálculo y exposición de KPIs** del dashboard: progreso de proyectos, tareas completadas, métricas agregadas por rol. Consulta `ms-project-manager` vía HTTP interno y expone un contrato estable para el BFF.

El frontend **no** llama a este servicio directamente: accede vía KrakenD → BFF → ms-kpi.

## Ejecución

### Requisitos

- Node.js 20+
- `ms-project-manager` en ejecución (:3002), o stack Docker Compose completo

### Instalación y desarrollo local

```bash
cd backend/ms-kpi
npm install
cp .env.example .env   # si existe
npm run dev
```

El servicio queda en `http://localhost:3004` bajo el prefijo `/api/v1`.

### Producción

```bash
npm run build
npm start
```

### Docker Compose (recomendado)

Desde `backend/`:

```bash
docker compose --env-file .env.docker up -d --build kpi
```

Acceso externo vía BFF/KrakenD: `GET http://localhost:8010/api/v1/kpis/dashboard`

### Tests

```bash
npm test
npm run test:ci
```

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto HTTP | `3004` |
| `API_GATEWAY_PREFIX` | Prefijo de rutas | `/api/v1` |
| `PROJECT_MANAGER_BASE_URL` | URL base de ms-project-manager | `http://localhost:3002` |
| `PROJECT_MANAGER_API_PREFIX` | Prefijo API de PM | `/api/v1` |
| `INTERNAL_REQUEST_TIMEOUT_MS` | Timeout HTTP interno | `5000` |

## Endpoints

| Acción | Método | Ruta interna | Roles |
|--------|--------|--------------|-------|
| Dashboard KPIs | GET | `/api/v1/kpis/dashboard` | gestor, profesional, directivo |
| Health | GET | `/health` | — |
| Swagger | GET | `/api-docs` | — |

Identidad del usuario: headers `X-User-Id`, `X-User-Email`, `X-User-Role` propagados por KrakenD (o JWT en desarrollo directo).

## Documentación relacionada

- [Guía central del proyecto](../../docs/README.md)
- [Backend general](../README.md)
- [BFF](../bff/README.md)
- [ms-project-manager](../ms-project-manager/README.md)
- [Manifiestos Kubernetes](./k8s/)
