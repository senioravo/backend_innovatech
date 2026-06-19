# Frontend — InnovaTech

## Especificación técnica

| Aspecto | Detalle |
|---------|---------|
| **Lenguaje** | TypeScript |
| **Framework** | React 18 + Vite 5 |
| **Librerías** | react-router-dom, @testing-library/react, @testing-library/user-event, jsdom |
| **Patrones de diseño** | SPA, Context API (estado de sesión), rutas protegidas, cliente HTTP centralizado (`bffClient`), separación pages / components / api / types |
| **Base de datos** | Ninguna (cliente; consume API vía KrakenD/BFF) |
| **Pruebas** | Vitest 4 + Testing Library + cobertura v8 (umbral mínimo 60%) |

## Descripción

Aplicación web de presentación para la plataforma InnovaTech. Permite iniciar sesión, visualizar proyectos y tareas, consultar KPIs, gestionar colaboración (comentarios/adjuntos) y operar según el rol del usuario (`gestor`, `profesional`, `directivo`).

Toda la comunicación con el backend se realiza contra el **API Gateway (KrakenD)** bajo el prefijo `/api/v1`, nunca directamente a los microservicios internos.

## Ejecución

### Requisitos

- Node.js 20+
- Backend en ejecución (recomendado: stack Docker Compose completo con KrakenD en `http://localhost:8010`)

### Instalación y desarrollo local

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

En desarrollo, Vite hace **proxy** de `/api` hacia `http://localhost:8010`, por lo que no es necesario configurar CORS manualmente.

### Producción

```bash
npm run build
npm run preview
```

Los artefactos estáticos se generan en `dist/`. En Kubernetes o Docker, sirve esa carpeta con nginx u otro servidor estático, apuntando las peticiones `/api/v1` al Ingress o al API Gateway.

### Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL base de la API (KrakenD/BFF) | `/api/v1` |

Con el valor por defecto, en desarrollo las peticiones pasan por el proxy de Vite. Para apuntar a otra URL (por ejemplo el cluster K8s):

```env
VITE_API_BASE_URL=http://api.innovatech.local/api/v1
```

## Estructura del proyecto

```
frontend/
├── public/              # Assets estáticos
├── src/
│   ├── api/
│   │   └── bffClient.ts       # Cliente HTTP hacia /api/v1
│   ├── auth/
│   │   └── AuthContext.tsx    # Sesión JWT en memoria/localStorage
│   ├── components/
│   │   └── ProtectedRoute.tsx # Guard de rutas autenticadas
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   └── DashboardPage.tsx  # Proyectos, tareas, KPIs, colaboración
│   ├── types/
│   │   └── api.ts             # Tipos TypeScript del contrato API
│   ├── test/
│   │   └── setup.ts           # Configuración Vitest
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── index.html
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## Flujos principales (demo)

| Flujo | Ruta | Descripción |
|-------|------|-------------|
| Login | `/login` | Autenticación con email y contraseña |
| Dashboard | `/dashboard` | Proyectos, tareas, KPIs y colaboración según rol |

### Usuarios de prueba (seed local)

Contraseña para todos: **`Secret123`**

| Email | Rol |
|-------|-----|
| `gestor@innovatech.cl` | gestor |
| `profesional@innovatech.cl` | profesional |
| `directivo@innovatech.cl` | directivo |

## Documentación relacionada

- [README raíz del repositorio](../README.md)
- [Backend y Docker Compose](../backend/README.md)
- [Guía central](../README.md)
- [Inicio rápido](../docs/INSTRUCCIONES-INICIO.md)
