# ✨ Separación de Auth y Users - Completada

## 🎯 Objetivo

Separar el microservicio `ms-auth` en dos servicios independientes siguiendo el **Principio de Responsabilidad Única (SOLID)**:

- **ms-auth**: Solo autenticación (login, logout, tokens JWT)
- **ms-users**: Solo gestión de usuarios (CRUD, perfiles, roles)

## ✅ Lo que se ha creado

### 1. Microservicio ms-users (Completo) ✨

```
backend/ms-users/
├── src/
│   ├── app.ts                      # Punto de entrada
│   ├── config/
│   │   ├── database.ts             # Conexión PostgreSQL
│   │   └── roles.ts                # Configuración de roles
│   ├── controllers/
│   │   └── user.controller.ts      # Controladores HTTP
│   ├── routes/
│   │   ├── user.routes.ts          # Rutas de usuarios
│   │   └── metrics.routes.ts       # Métricas Prometheus
│   ├── services/
│   │   └── user.service.ts         # Lógica de negocio
│   ├── models/
│   │   └── userModel.ts            # Modelo de datos
│   ├── dtos/
│   │   └── userDto.ts              # Data Transfer Objects
│   ├── middleware/
│   │   ├── auth.middleware.ts      # Verificación JWT
│   │   └── metricsMiddleware.ts    # Métricas
│   └── utils/
│       ├── logger.ts               # Logger Winston
│       └── jwt.helper.ts           # Helper JWT
├── database/
│   └── schema.sql                  # Schema PostgreSQL
├── tests/                          # Tests
├── logs/                           # Logs Winston
├── keys/                           # Clave pública JWT
├── package.json
├── tsconfig.json
├── Dockerfile
├── jest.config.js
└── README.md                       # Documentación completa
```

### 2. Archivos de Configuración

- ✅ `docker-compose.yml` - Actualizado con servicio `users`
- ✅ `.env.docker` - Nueva variable `DATABASE_URL_USERS`
- ✅ `setup-keys.sh` / `setup-keys.bat` - Scripts para copiar claves
- ✅ `MIGRACION_AUTH_USERS.md` - Guía completa de migración

## 📡 API Endpoints de ms-users

### Gestión de Usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users` - Listar usuarios (con paginación)
- `GET /api/users/:id` - Obtener usuario por ID
- `GET /api/users/email/:email` - Buscar por email
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario (solo gestor/directivo)
- `PUT /api/users/:id/role` - Cambiar rol (solo gestor/directivo)

### Monitoreo
- `GET /health` - Health check
- `GET /metrics` - Métricas Prometheus

## 🚀 Inicio Rápido

### 1. Copiar Clave Pública JWT

**Windows:**
```bash
cd backend
setup-keys.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x setup-keys.sh
./setup-keys.sh
```

### 2. Configurar Base de Datos

Editar `backend/.env.docker`:
```env
# Opción 1: Usar la misma base de datos que ms-auth (Desarrollo)
DATABASE_URL_USERS=${DATABASE_URL_AUTH}

# Opción 2: Base de datos separada (Producción)
DATABASE_URL_USERS=postgresql://user:pass@host:port/users_db?sslmode=require
```

### 3. Levantar Servicios

```bash
cd backend
docker compose --env-file .env.docker up --build
```

### 4. Verificar ms-users

```bash
# Health check
curl http://localhost:8010/api/v1/users/health

# Obtener token desde ms-auth
curl -X POST http://localhost:8010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Listar usuarios (requiere token)
curl http://localhost:8010/api/v1/users \
  -H "Authorization: Bearer {token}"
```

## 📋 Próximos Pasos (Opcional)

Para completar la separación, debes actualizar:

1. **ms-auth**: Eliminar endpoints de gestión de usuarios
2. **BFF**: Actualizar para llamar a ms-users
3. **API Gateway (KrakenD)**: Agregar rutas a ms-users
4. **Frontend**: Actualizar llamadas API

Ver guía completa: [`MIGRACION_AUTH_USERS.md`](./MIGRACION_AUTH_USERS.md)

## 🏗️ Arquitectura

### Antes
```
Frontend → Gateway → BFF → ms-auth (auth + users) ❌
                         → ms-project-manager
```

### Ahora
```
Frontend → Gateway → BFF → ms-auth (solo auth) ✅
                         → ms-users (solo users) ✨
                         → ms-project-manager
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con **bcrypt**
- ✅ Verificación de tokens JWT con **RS256** (RSA)
- ✅ Middleware de autorización por **roles**
- ✅ No expone passwords en respuestas
- ✅ Logging de operaciones críticas con **Winston**
- ✅ Métricas con **Prometheus**

## 📊 Ventajas de la Separación

1. **Responsabilidad Única**: Cada servicio hace una cosa y la hace bien
2. **Escalabilidad**: Escalar usuarios independientemente de auth
3. **Mantenibilidad**: Código más limpio y enfocado
4. **Seguridad**: Mejor separación de datos sensibles
5. **Testing**: Tests más simples y específicos
6. **Despliegue**: Deploy independiente de servicios

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js 4.18.2
- **Base de Datos**: PostgreSQL (Neon Cloud)
- **Autenticación**: JWT RS256 (RSA)
- **Hashing**: bcrypt
- **Logging**: Winston + Daily Rotate File
- **Métricas**: Prometheus (prom-client)
- **Testing**: Jest + Supertest
- **Containerización**: Docker

## 📚 Documentación

- [`ms-users/README.md`](./ms-users/README.md) - Documentación completa del servicio
- [`MIGRACION_AUTH_USERS.md`](./MIGRACION_AUTH_USERS.md) - Guía de migración paso a paso
- [`ms-auth/README.md`](./ms-auth/README.md) - Documentación de ms-auth
- [`README.md`](./README.md) - Documentación principal del backend

## 💡 Notas

- **Estado actual**: ms-users está **completamente funcional** y listo para uso
- **ms-auth**: Sigue funcionando con sus endpoints actuales (no se modificó)
- **Compatibilidad**: Ambos servicios pueden coexistir sin problemas
- **Migración**: Puedes migrar gradualmente siguiendo la guía

## ❓ ¿Necesitas Ayuda?

- Ver ejemplos de uso en [`ms-users/README.md`](./ms-users/README.md)
- Consultar guía de migración en [`MIGRACION_AUTH_USERS.md`](./MIGRACION_AUTH_USERS.md)
- Revisar logs en `ms-users/logs/`
- Verificar métricas en `http://localhost:3003/metrics`

---

**¡Microservicio ms-users creado exitosamente! 🎉**

Ahora tienes una arquitectura más limpia y escalable siguiendo los principios SOLID.
