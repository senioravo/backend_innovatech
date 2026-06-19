# API Gateway (KrakenD) — InnovaTech

## Especificación técnica

| Aspecto | Detalle |
|---------|---------|
| **Lenguaje** | Configuración declarativa JSON (KrakenD) |
| **Framework** | KrakenD 2.7 |
| **Librerías** | auth/validator (JWT + JWKS), security/cors, telemetry/logging, backend/http |
| **Patrones de diseño** | API Gateway, validación JWT (RS256), RBAC en gateway, propagación de claims (`X-User-*`), agregación de backends |
| **Base de datos** | Ninguna (proxy sin estado) |
| **Pruebas** | Manuales / integración vía Docker Compose y pruebas E2E del frontend |

## Descripción

Punto único de entrada HTTP para el frontend. Valida tokens JWT consultando el JWKS de `ms-auth`, aplica CORS, control de roles y reenvía peticiones al BFF u otros backends según `krakend.json`.

## Ejecución

### Requisitos

- Docker Desktop (recomendado), o binario KrakenD 2.7+
- Stack interno: BFF, ms-auth, ms-users, ms-project-manager

### Docker Compose (recomendado)

Desde `backend/`:

```bash
# Primera vez: generar claves RSA en ms-auth
cd ms-auth && node scripts/generate-keys.js && cd ..

cp .env.docker.example .env.docker
docker compose --env-file .env.docker up -d --build api-gateway
```

| Recurso | URL |
|---------|-----|
| API pública | http://localhost:8010/api/v1/ |
| JWKS (proxy) | http://localhost:8010/.well-known/jwks.json |
| Health KrakenD | http://localhost:8010/__health |

### Kubernetes

Manifiestos en `k8s/` con ConfigMap de `krakend.json` adaptado a DNS del cluster. Ver [k8s/README.md](./k8s/README.md) y [../k8s/README.md](../k8s/README.md).

### KrakenD local (sin Compose)

```bash
docker run --rm -p 8080:8080 \
  -v $(pwd)/krakend.json:/etc/krakend/krakend.json \
  devopsfaith/krakend:2.7
```

Ajustar hosts en `krakend.json` a `localhost` si los backends corren fuera de Docker.

## Configuración principal

Archivo: `krakend.json`

- **Puerto:** 8080 (expuesto como 8010 en Compose)
- **JWT:** RS256 vía `http://auth:3001/.well-known/jwks.json`
- **Claims propagados:** `id` → `X-User-Id`, `email` → `X-User-Email`, `role` → `X-User-Role`
- **Rutas públicas:** `/api/v1/auth/login`, `/api/v1/auth/register`
- **Rutas protegidas:** proyectos, tareas, KPIs, notificaciones → BFF

## Documentación relacionada

- [Backend general](../README.md)
- [Implementación JWT](./KRAKEND_JWT_IMPLEMENTATION.md)
- [Manifiestos Kubernetes](./k8s/README.md)
