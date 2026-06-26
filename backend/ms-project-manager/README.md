# Microservicio Project Manager — InnovaTech

## Especificación técnica

| Aspecto | Detalle |
|---------|---------|
| **Lenguaje** | TypeScript (Node.js 20+) |
| **Framework** | Express.js 4.18 |
| **Librerías** | pg, prom-client, @elastic/elasticsearch, jsonwebtoken, cors, dotenv, swagger-jsdoc, swagger-ui-express |
| **Patrones de diseño** | Repository, capa de servicio, DTO + validación, controlador delgado, RBAC, circuit breaker (Opossum), database per service |
| **Base de datos** | PostgreSQL (`innovatech_pm` / `pm-db`) |
| **Pruebas** | Jest 29 + Supertest 7 + ts-jest |

## Descripción

Microservicio de gestión de proyectos, tareas, colaboración (comentarios/adjuntos), consultas exportables y auditoría. Los **KPIs del dashboard** se calculan en **ms-kpi** (`/api/v1/kpis/dashboard` vía BFF); este servicio mantiene consultas legacy en `/api/v1/consultations/kpis`.

## Ejecución

### Requisitos

- Node.js 20+
- PostgreSQL 14+ (local `:5434` con Docker Compose o Neon)

### Instalación y desarrollo local

```bash
cd backend/ms-project-manager
npm install
cp .env.example .env
# Configurar DATABASE_URL y claves JWT según .env.example
npm run db:migrate
npm run dev
```

El servicio queda en `http://localhost:3002`.

### Producción

```bash
npm run build
npm start
```

### Docker Compose (recomendado)

Desde `backend/`:

```bash
docker compose --env-file .env.docker up -d --build project-manager
```

Acceso externo vía KrakenD: `http://localhost:8010/api/v1/projects`.

### Tests

```bash
npm test
npm run test:coverage
```

## Variables de entorno principales

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto HTTP | `3002` |
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://...` |
| `JWT_SECRET` | Verificación JWT (desarrollo) | — |
| `AUTH_SERVICE_URL` | URL de ms-auth (validación opcional) | `http://auth:3001` |
| `ELASTICSEARCH_NODE` | Auditoría centralizada (opcional) | — |
| `ENABLE_METRICS` | Activar `/metrics` Prometheus | `1` |

## Endpoints de referencia

| Acción | Método | Ruta interna |
|--------|--------|----------------|
| Listar proyectos | GET | `/api/v1/projects` |
| Crear proyecto | POST | `/api/v1/projects` |
| Tareas de proyecto | GET | `/api/v1/projects/:id/tasks` |
| Cambiar estado tarea | PATCH | `/api/v1/projects/:id/tasks/:taskId/status` |
| KPIs (legacy / export) | GET | `/api/v1/consultations/kpis` |
| Health | GET | `/health` |
| Métricas | GET | `/metrics` |

> **Dashboard KPIs:** el frontend consume `GET /api/v1/kpis/dashboard` (BFF → **ms-kpi**).

## Documentación relacionada

- [Guía central del proyecto](../../docs/README.md)
- [Backend general](../README.md)
- [ms-kpi](../ms-kpi/README.md)
- [Migraciones Flyway](./db/flyway/README.md)
- [Manifiestos Kubernetes](./k8s/README.md)
