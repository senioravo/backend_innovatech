# InnovaTech — Backend

Plataforma backend basada en **microservicios** para gestión de proyectos, tareas y autenticación. El cliente (frontend) se comunica **únicamente** con el **BFF**, expuesto a través de un **API Gateway** (nginx).

---

## Tabla de contenidos

1. [Visión general](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Microservicios](#microservicios)
4. [Patrones y justificación](#patrones-y-justificación)
5. [Estrategia de branching (Git)](#estrategia-de-branching-git)
6. [Testing](#testing)
7. [Inicio rápido](#inicio-rápido)
8. [Estructura del repositorio](#estructura-del-repositorio)
9. [Documentación de estudio](#documentación-de-estudio)

---

## Visión general

| Aspecto | Detalle |
|--------|---------|
| **Entrada HTTP** | `http://localhost:8080/api/v1/...` |
| **Stack** | Node.js, Express, PostgreSQL (Neon), Docker Compose |
| **Seguridad** | JWT compartido (`JWT_SECRET`) entre Auth, PM y BFF |
| **Roles** | `gestor`, `profesional`, `directivo` (RBAC) |

El diseño separa **identidad** (Auth), **dominio de negocio** (Project Manager) y **adaptación al cliente** (BFF), de modo que el frontend no conoce URLs internas ni contratos crudos de cada microservicio.

---

## Arquitectura

```mermaid
flowchart LR
  subgraph Cliente
    FE[Frontend React]
  end

  subgraph Infra
    GW[API Gateway<br/>nginx :8080]
  end

  subgraph Backend
    BFF[BFF :3010]
    AUTH[Auth :3001]
    PM[Project Manager :3002]
  end

  subgraph Datos
    DBA[(PostgreSQL Auth)]
    DBP[(PostgreSQL PM)]
  end

  FE -->|HTTPS /api/v1| GW
  GW --> BFF
  BFF --> AUTH
  BFF --> PM
  AUTH --> DBA
  PM --> DBP
```

**Flujo típico (login + listar proyectos):**

```mermaid
sequenceDiagram
  participant C as Cliente
  participant G as API Gateway
  participant B as BFF
  participant A as Auth
  participant P as Project Manager

  C->>G: POST /api/v1/login
  G->>B: forward
  B->>A: POST /api/auth/login
  A-->>B: JWT + usuario
  B-->>C: sesión unificada

  C->>G: GET /api/v1/proyectos + Bearer
  G->>B: forward
  B->>P: GET /api/v1/projects
  B->>A: GET usuarios (enriquecimiento)
  B-->>C: JSON en español (proyectos + responsables)
```

---

## Microservicios

| Servicio | Puerto (Docker) | Responsabilidad | Documentación |
|----------|-----------------|-----------------|---------------|
| **API Gateway** | 8080 | Punto único de entrada, proxy a BFF | `infra/api-gateway/nginx.conf` |
| **BFF** | 3010 | Orquestación, roles, contrato front | [README-ESTUDIO](services/bff/README-ESTUDIO.md) |
| **Auth** | 3001 | Registro, login, JWT, roles, blacklist | [README-ESTUDIO](services/auth/README-ESTUDIO.md) |
| **Project Manager** | 3002 | Proyectos, tareas, consultas, auditoría | [README-ESTUDIO](services/project-manager/README-ESTUDIO.md) |

---

## Patrones y justificación

### Arquetipos arquitectónicos

| Arquetipo | Dónde | Por qué |
|-----------|-------|---------|
| **Microservicios** | Auth, PM, BFF | Equipos y despliegues independientes; cada servicio escala y evoluciona según su dominio. |
| **API Gateway** | nginx | Un solo host/puerto para el cliente; oculta topología interna y centraliza TLS/routing en producción. |
| **BFF (Backend for Frontend)** | `services/bff` | El front necesita respuestas agregadas y en español; evita acoplar la UI a contratos REST crudos de Auth y PM. |
| **Monolito modular (Auth / PM)** | Capas controller → service → repository | Dominio acotado por servicio sin la complejidad operativa de muchos despliegues internos. |

### Patrones de diseño utilizados

| Patrón | Ubicación | Justificación |
|--------|-----------|---------------|
| **Arquitectura en capas** | BFF (`presentation` / `application` / `infrastructure`) | Separa HTTP, orquestación y clientes HTTP; facilita tests y cambios de upstream sin tocar rutas. |
| **Orquestación** | `*OrchestrationService.js` en BFF | Coordina Auth + PM en una sola petición del front (p. ej. proyectos con nombres de responsables). |
| **Repository** | PM (`projectRepository`, `taskRepository`) | Aísla SQL/PostgreSQL de la lógica de negocio; los servicios no conocen detalles de persistencia. |
| **DTO / Transformer** | PM (`dtos/`), BFF (`frontendResponseTransformers`) | Contrato estable hacia fuera; el BFF traduce inglés → español sin mutar los microservicios internos. |
| **Middleware chain** | Express en los tres servicios | Autenticación JWT, roles, métricas y auditoría de forma composable y reutilizable. |
| **API Gateway (router interno)** | `apiGateway.js` en BFF y PM | Agrupa rutas bajo un prefijo común (`/api/v1`) sin un solo archivo monolítico de rutas. |
| **Circuit Breaker** | Auth, PM (`circuitBreaker.js`, opossum) | Protege llamadas a dependencias (p. ej. Elasticsearch) ante fallos en cascada. |
| **Singleton** | Pools de BD, config | Una instancia de conexión/config por proceso Node. |
| **RBAC** | Auth (emisión `rol`), BFF/PM (`requireRole`) | Autorización declarativa por rol en cada capa que expone datos sensibles. |
| **Errores de dominio** | `errorHandler.js`, `ValidationError`, `UpstreamError` | Respuestas HTTP coherentes y tipado de fallos (validación vs upstream vs no encontrado). |
| **Observabilidad** | Prometheus (`/metrics`), Winston, auditoría Elasticsearch | Métricas y trazabilidad sin mezclar logging con lógica de negocio. |

### Principios que guían el diseño

- **Single responsibility:** cada microservicio tiene un bounded context claro.
- **Fail fast:** validación en BFF/PM antes de llamar a BD o upstream.
- **Contrato único hacia el cliente:** el front solo habla con `/api/v1` vía gateway.
- **Secretos compartidos con criterio:** mismo `JWT_SECRET` solo entre servicios que validan el mismo token.

---

## Estrategia de branching (Git)

Se usa un flujo **Git Flow simplificado**: integración en `develop`, releases en `main`, y ramas de feature por tarea o módulo.

### Ramas principales

| Rama | Propósito |
|------|-----------|
| `main` | Código estable / entregable |
| `develop` | Integración continua de features |
| `feat/*` | Desarrollo por historia (BFF, PM, Auth, front) |
| `feature/*` | Variante de nomenclatura para Auth (`feature/AS-TASK-XX`) |

### Convención de nombres (ejemplos reales del repo)

```
feat/BFF-01-BASE-STRUCTURE
feat/BFF-05-ENDPOINTS-ROUTES
feat/PM-08-CRUD-TASK
feat/PM-13-STATE-TRANSITION-VALIDATION
feature/AS-TASK-01-estructura-auth
```

### Flujo de trabajo

```mermaid
gitGraph
  commit id: "main-inicial"
  branch develop
  checkout develop
  commit id: "integración-base"

  branch feat/PM-08-CRUD-TASK
  checkout feat/PM-08-CRUD-TASK
  commit id: "PM: CRUD tareas"
  checkout develop
  merge feat/PM-08-CRUD-TASK tag: "PR #38"

  branch feat/BFF-01-BASE-STRUCTURE
  checkout feat/BFF-01-BASE-STRUCTURE
  commit id: "BFF: estructura"
  checkout develop
  merge feat/BFF-01-BASE-STRUCTURE tag: "PR #42"

  branch feat/BFF-03-API-GATEWAY
  checkout feat/BFF-03-API-GATEWAY
  commit id: "Docker + nginx"
  checkout develop
  merge feat/BFF-03-API-GATEWAY

  checkout main
  merge develop tag: "release"
```

### Comandos útiles

```bash
# Ver historial visual
git log --oneline --graph --all -30

# Crear feature desde develop
git checkout develop
git pull origin develop
git checkout -b feat/PM-15-mi-feature

# Integrar vía Pull Request hacia develop (recomendado)
# Luego merge periódico develop → main en releases
```

**Regla práctica:** una rama `feat/*` por historia; commits descriptivos (`PM Task-14: …`, `BFF Task-05: …`); no mezclar BFF y PM en la misima rama salvo integración explícita.

---

## Testing

Estrategia **por capas**: tests unitarios en lógica pura; Auth además incluye tests de integración HTTP.

| Servicio | Herramienta | Ubicación | Qué se prueba |
|----------|-------------|-----------|---------------|
| **Auth** | Jest (+ Supertest en rutas) | `services/auth/tests/` | JWT, bcrypt, roles, rutas auth, métricas |
| **Project Manager** | Jest | `services/project-manager/tests/` | Estados de tarea, validación, DTOs, errores |
| **BFF** | Jest | `services/bff/tests/` | Transformadores, roles, `joinUrl`, errores |

### Ejecutar tests

```bash
# Auth
cd services/auth && npm test

# Project Manager
cd services/project-manager && npm test

# BFF
cd services/bff && npm test
```

### Filosofía

- **Sin BD en tests unitarios** de PM/BFF: validadores, constantes y middleware se prueban aislados.
- **Auth:** suite más amplia (integración con app Express); requiere `.env` y BD para pasar al 100%.
- **CI recomendado:** `npm test` en cada PR hacia `develop`.

---

## Inicio rápido

### Requisitos

- Node.js 20+
- Docker Desktop
- URLs PostgreSQL (Neon u otro) para Auth y PM

### Docker Compose (recomendado)

```bash
cd backend_innovatech
cp .env.docker.example .env.docker
# Editar DATABASE_URL_AUTH, DATABASE_URL_PM, JWT_SECRET

docker compose --env-file .env.docker up --build
```

| Endpoint | URL |
|----------|-----|
| API (gateway) | http://localhost:8080/api/v1/ |
| Health gateway | http://localhost:8080/gateway-health |
| Health BFF | http://localhost:8080/health |

### Desarrollo local (servicio a servicio)

Ver cada [README-ESTUDIO](#documentación-de-estudio) para puertos, variables y migraciones.

---

## Estructura del repositorio

```
backend_innovatech/
├── README.md                    ← este documento
├── docker-compose.yml
├── .env.docker.example
├── infra/
│   └── api-gateway/
│       └── nginx.conf
├── services/
│   ├── auth/                    ← microservicio Auth
│   ├── bff/                     ← Backend for Frontend
│   └── project-manager/         ← dominio proyectos/tareas
└── ...
```

---

## Documentación de estudio

Guías orientadas a **entender y presentar** cada componente:

| Microservicio | Guía |
|---------------|------|
| Auth | [services/auth/README-ESTUDIO.md](services/auth/README-ESTUDIO.md) |
| BFF | [services/bff/README-ESTUDIO.md](services/bff/README-ESTUDIO.md) |
| Project Manager | [services/project-manager/README-ESTUDIO.md](services/project-manager/README-ESTUDIO.md) |

Documentación operativa detallada de Auth: [services/auth/README.md](services/auth/README.md).

---

## Licencia

MIT © InnovaTech
