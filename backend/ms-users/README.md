# Microservicio Users - InnovaTech

## Especificación técnica

| Aspecto | Detalle |
|---------|---------|
| **Lenguaje** | TypeScript (Node.js 20+) |
| **Framework** | Express.js 4.18 |
| **Librerías** | bcrypt, pg, jsonwebtoken, winston, prom-client, opossum, cors, dotenv, swagger-jsdoc, swagger-ui-express, @elastic/elasticsearch |
| **Patrones de diseño** | Repository, capa de servicio, DTO + validación, controlador delgado, RBAC, circuit breaker, database per service |
| **Base de datos** | PostgreSQL (Neon Cloud o local; `innovatech_users` / `users-db`) |
| **Pruebas** | Jest 30 + Supertest 7 + ts-jest |

## Descripción

Microservicio de gestión de usuarios para la plataforma InnovaTech. Proporciona funcionalidades CRUD completas para usuarios, gestión de perfiles y asignación de roles. Este microservicio fue separado de ms-auth para aplicar el **Principio de Responsabilidad Única (SOLID)**.

## Responsabilidades

- ✅ **Gestión de usuarios**: CRUD completo de usuarios
- ✅ **Perfiles de usuario**: Consulta y actualización de datos de perfil
- ✅ **Gestión de roles**: Asignación y cambio de roles
- ✅ **Búsqueda y filtrado**: Listado de usuarios con paginación
- ✅ **Validación de datos**: Validación de emails, nombres y roles

## Arquitectura

- **Framework:** Express.js v4.18.2
- **Base de datos:** PostgreSQL (Neon Cloud Database)
- **Autenticación:** Verificación de JWT (tokens generados por ms-auth)
- **Hashing:** bcrypt con 10 salt rounds
- **Testing:** Jest v30.4.2 + Supertest v7.2.2
- **Logging:** Winston v3.19.0
- **Monitoreo:** Prometheus (prom-client v15.1.3)

## Separación de Responsabilidades

### ms-auth (Autenticación)
- Login y logout
- Generación y validación de tokens JWT
- Blacklist de tokens
- Endpoint JWKS para claves públicas

### ms-users (Gestión de Usuarios) ✨ Este servicio
- CRUD de usuarios
- Gestión de perfiles
- Asignación de roles
- Listado y búsqueda de usuarios

## API Endpoints

### Usuarios

#### Crear usuario
```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "securepass123",
  "rol": "profesional"
}
```

#### Listar usuarios
```http
GET /api/users?page=1&limit=10&rol=gestor&search=juan
Authorization: Bearer {token}
```

#### Obtener usuario por ID
```http
GET /api/users/:id
Authorization: Bearer {token}
```

#### Buscar usuario por email
```http
GET /api/users/email/:email
Authorization: Bearer {token}
```

#### Actualizar usuario
```http
PUT /api/users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Juan Pérez Actualizado",
  "email": "juan.nuevo@example.com"
}
```

#### Eliminar usuario (solo gestor/directivo)
```http
DELETE /api/users/:id
Authorization: Bearer {token}
```

#### Cambiar rol de usuario (solo gestor/directivo)
```http
PUT /api/users/:id/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "rol": "gestor"
}
```

### Roles Disponibles

- **gestor**: Gestiona proyectos, asigna tareas y supervisa equipos
- **profesional**: Ejecuta tareas asignadas y colabora en proyectos
- **directivo**: Visualiza KPIs y métricas del negocio

### Métricas

```http
GET /metrics
```

Retorna métricas en formato Prometheus.

### Health Check

```http
GET /health
```

## Instalación

### 1. Instalar Dependencias

```bash
cd backend/ms-users
npm install
```

### 2. Configurar Variables de Entorno

Crear archivo `.env`:

```env
# Servidor
PORT=3003
NODE_ENV=development

# Base de Datos
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# JWT - Verificación de tokens (clave pública de ms-auth)
JWT_PUBLIC_KEY_PATH=./keys/jwt_public.pem

# Logging
LOG_LEVEL=info
```

### 3. Crear Base de Datos

Ejecutar el script SQL:

```bash
psql -h host -U user -d database -f database/schema.sql
```

### 4. Copiar Clave Pública JWT

Copiar la clave pública de ms-auth para verificar tokens:

```bash
cp ../ms-auth/keys/public.key ./keys/jwt_public.pem
```

### 5. Ejecutar el Microservicio

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm run build
npm start
```

## Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage

# Modo watch
npm run test:watch
```

## Docker

### Build

```bash
docker build -t ms-users .
```

### Run

```bash
docker run -p 3003:3003 --env-file .env ms-users
```

### Docker Compose

```bash
docker compose --env-file .env.docker up ms-users
```

## Estructura del Proyecto

```
ms-users/
├── src/
│   ├── app.ts                  # Punto de entrada
│   ├── config/
│   │   ├── database.ts         # Configuración de PostgreSQL
│   │   └── roles.ts            # Definición de roles
│   ├── controllers/
│   │   └── user.controller.ts  # Controlador de usuarios
│   ├── routes/
│   │   ├── user.routes.ts      # Rutas de usuarios
│   │   └── metrics.routes.ts   # Rutas de métricas
│   ├── services/
│   │   └── user.service.ts     # Lógica de negocio
│   ├── models/
│   │   └── userModel.ts        # Modelo de usuario
│   ├── dtos/
│   │   └── userDto.ts          # Data Transfer Objects
│   ├── middleware/
│   │   ├── auth.middleware.ts      # Verificación de JWT
│   │   └── metricsMiddleware.ts    # Métricas Prometheus
│   └── utils/
│       ├── logger.ts           # Logger con Winston
│       └── jwt.helper.ts       # Helper de JWT
├── database/
│   └── schema.sql              # Script de base de datos
├── tests/                      # Tests unitarios
├── logs/                       # Logs de Winston
├── keys/                       # Clave pública JWT
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## Principios SOLID Aplicados

- **Single Responsibility**: Cada clase/módulo tiene una única responsabilidad
- **Open/Closed**: Extensible sin modificar código existente
- **Liskov Substitution**: DTOs intercambiables
- **Interface Segregation**: Interfaces específicas por necesidad
- **Dependency Inversion**: Inyección de dependencias

## Integración con Otros Servicios

### ms-auth
- ms-users **verifica** tokens JWT generados por ms-auth
- Usa la **clave pública** de ms-auth para validación
- No genera tokens propios

### BFF
- BFF llama a ms-users para operaciones CRUD de usuarios
- BFF llama a ms-auth para login/logout
- Separa responsabilidades claramente

### API Gateway (KrakenD)
- Enruta `/api/users/*` → ms-users:3003
- Enruta `/api/auth/*` → ms-auth:3001

## Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Verificación de tokens JWT con clave pública RSA
- ✅ Validación de entrada con DTOs
- ✅ Middleware de autorización por roles
- ✅ No expone passwords en respuestas
- ✅ Logging de operaciones críticas

## Monitoreo

- **Prometheus**: Métricas de requests, duración y operaciones CRUD
- **Winston**: Logs rotativos por fecha y tamaño
- **Health Check**: Endpoint para verificar estado del servicio

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | 3003 |
| `NODE_ENV` | Entorno | development/production |
| `DATABASE_URL` | URL de PostgreSQL | postgresql://... |
| `JWT_PUBLIC_KEY_PATH` | Ruta a clave pública | ./keys/jwt_public.pem |
| `JWT_ISSUER` | Emisor del token | innovatech-auth |
| `LOG_LEVEL` | Nivel de logs | info/debug/error |

## Licencia

ISC
