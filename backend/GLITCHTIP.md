# Integración GlitchTip — Backend Innovatech

GlitchTip es un sistema de monitoreo de errores **compatible con el protocolo Sentry**. Cada microservicio Node.js envía excepciones y mensajes a GlitchTip usando `@sentry/node`.

## Requisitos

- Instancia GlitchTip con un proyecto creado
- DSN del proyecto (Settings → Client Keys)

El DSN apunta a **app.glitchtip.com** (GlitchTip cloud) o a tu servidor self-hosted:

```
https://<public-key>@app.glitchtip.com/<project-id>
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `SENTRY_DSN` | DSN de GlitchTip (obligatorio para activar) |
| `SENTRY_RELEASE` | Versión de la app (ej. `1.0.0`) |
| `SENTRY_ENVIRONMENT` | `development`, `staging`, `production` |
| `SENTRY_TRACES_SAMPLE_RATE` | Muestreo de traces (0.1 recomendado en prod) |

Si `SENTRY_DSN` no está definido, los servicios arrancan con un aviso y **no envían eventos** (desarrollo local sin GlitchTip).

## Arquitectura

```
Request HTTP
    │
    ├──► requestIdMiddleware → X-Request-Id + tag request_id en Sentry
    │
    ├──► Rutas de negocio / demo
    │
    └──► handleError (global)
              │
              └──► captureException → GlitchTip Issues

Llamadas entre MS (BFF → auth → users, KPI → PM)
    └──► header X-Request-Id propagado automáticamente
```

### Componentes por microservicio (`src/observability/`)

| Archivo | Responsabilidad |
|---|---|
| `glitchtip.ts` | Inicializa Sentry, `captureException`, `captureMessage` |
| `requestIdContext.ts` | AsyncLocalStorage + propagación de headers |
| `requestIdMiddleware.ts` | Genera/reutiliza `X-Request-Id` por request |
| `demoRoutes.ts` | Endpoints de prueba |

## Endpoints de prueba

Disponibles en **todos** los microservicios bajo `/api/demo`:

| Endpoint | Qué hace |
|---|---|
| `GET /api/demo/health` | Health + requestId |
| `GET /api/demo/log` | Log info + mensaje a GlitchTip |
| `GET /api/demo/message` | Mensaje warning a GlitchTip |
| `GET /api/demo/error` | Lanza error → GlitchTip Issues |

### Puertos locales (docker compose)

| Servicio | URL demo error |
|---|---|
| BFF | `http://localhost:3010/api/demo/error` |
| ms-auth | `http://localhost:3001/api/demo/error` |
| ms-users | `http://localhost:3003/api/demo/error` |
| ms-project-manager | `http://localhost:3002/api/demo/error` |
| ms-kpi | `http://localhost:3004/api/demo/error` |

### Probar con request ID

```bash
curl -v -H "X-Request-Id: prueba-001" http://localhost:3010/api/demo/error
```

En GlitchTip Issues, buscar: `is:unresolved prueba-001`

El mensaje del error incluye `[requestId=prueba-001]` para búsqueda por texto.

## Docker Compose

Añade en `.env.docker`:

```env
SENTRY_DSN=https://<key>@tu-glitchtip/<project-id>
SENTRY_ENVIRONMENT=development
SENTRY_RELEASE=1.0.0
SENTRY_TRACES_SAMPLE_RATE=0.1
```

Las variables se propagan a todos los servicios en `docker-compose.yml`.

## Informe para evaluación (resumen)

1. **Problema:** Los errores en microservicios solo quedaban en consola/archivos locales; no había correlación entre servicios.
2. **Solución:** Integración GlitchTip vía SDK Sentry en BFF, ms-auth, ms-users, ms-project-manager y ms-kpi.
3. **Captura centralizada:** El handler global reporta errores 500 a GlitchTip Issues con tag `request_id`.
4. **Correlación:** Middleware `X-Request-Id` propagado en llamadas HTTP internas.
5. **Verificación:** Endpoints `/api/demo/*` + búsqueda en GlitchTip por request id.

## Referencia

Basado en el ejemplo Java `ms-log-example` del curso (Spring Boot + Sentry SDK). En Node.js usamos `@sentry/node` con la misma API de GlitchTip.
