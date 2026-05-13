# Backend Innovatech Chile

## Microservicios

### Auth (Autenticación)
Microservicio de autenticación y autorización.

**Estructura:**
```
auth/
├── src/
│   ├── controllers/    # Controladores de endpoints
│   ├── services/       # Lógica de negocio
│   ├── middleware/     # Validación JWT y roles
│   ├── config/         # Configuración
│   ├── utils/          # Helpers
│   └── app.js          # Servidor Express
├── .env.example        # Variables de entorno
├── .gitignore
└── package.json
```

**Endpoints disponibles:**
- POST `/api/auth/register` - Registro de usuarios con PostgreSQL y bcrypt (AS-TASK-04)
- POST `/api/auth/login` - Inicio de sesión con JWT (AS-TASK-05)
- POST `/api/auth/logout` - Cerrar sesión / Invalidar token JWT
- GET `/api/auth/roles` - Listar roles disponibles del sistema
- PUT `/api/auth/usuarios/:id/rol` - Asignar o cambiar rol de un usuario
- GET `/api/auth/health` - Health check para monitoreo

**Endpoints Circuit Breaker (AS-TASK-03):**
- GET `/api/circuit-breaker/test/auth` - Probar Circuit Breaker con AuthService
- GET `/api/circuit-breaker/test/project` - Probar Circuit Breaker con ProjectManager
- GET `/api/circuit-breaker/stats` - Obtener estadísticas de Circuit Breakers

**Circuit Breaker Configuration:**
- Timeout: 3000ms
- Error Threshold: 50%
- Reset Timeout: 30s
- Fallback: "Servicio no disponible"
- Observabilidad: Logs integrados

**Formato de respuesta JSON:**
```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "taskId": "AS-TASK-02",
  "data": {}
}
```

**Iniciar servicio:**
```bash
cd auth
npm install
npm run dev
```

## Tareas completadas
- [COMPLETADO] AS-TASK-01: Estructura base del microservicio Auth
- [COMPLETADO] AS-TASK-02: Integración con API Gateway
  - Endpoints REST creados
  - Rutas con identificadores únicos (taskId)
  - Validación de respuesta JSON
  - Manejo de errores implementado
- [COMPLETADO] AS-TASK-03: Circuit Breaker para llamadas internas
  - Implementado con librería Opossum
  - Timeout: 3000ms, Error Threshold: 50%
  - Fallback: "Servicio no disponible"
  - Logs para observabilidad
  - Variables de entorno configuradas
  - Trazabilidad académica completa
- [COMPLETADO] AS-TASK-04: Endpoint POST /api/auth/register
  - Validación completa de campos obligatorios (nombre, email, password, rol)
  - Cifrado de contraseñas con bcrypt (SALT_ROUNDS=10)
  - Integración con PostgreSQL (tabla usuarios)
  - Verificación de email duplicado
  - Logs de auditoría para trazabilidad
  - Manejo de errores con status HTTP apropiados (400, 201, 500)
  - Principios SOLID: Separación Controller/Service
  - Formato JSON estandarizado con taskId
  - Script SQL de migración incluido (auth/database/schema.sql)
- [COMPLETADO] AS-TASK-05: Endpoint POST /api/auth/login
  - Validación de email y password
  - Consulta a PostgreSQL para verificar usuario
  - Verificación de contraseña con bcrypt.compare
  - Generación de token JWT firmado (jsonwebtoken)
  - Payload JWT: id, email, rol del usuario
  - Expiración configurable (24h por defecto)
  - Logs de auditoría para intentos exitosos y fallidos
  - Manejo de errores HTTP (400, 401, 500)
  - Principios SOLID implementados
  - Formato JSON estandarizado con taskId
- [COMPLETADO] AS-TASK-06: Validación de credenciales y generación segura de JWT
  - Refactorización con arquitectura limpia (SOLID)
  - Creado `jwt.helper.js` para centralizar lógica JWT
  - Validación mejorada de formato de email
  - Validación de fortaleza de contraseña
  - Expiración más segura: 1h (configurable)
- [COMPLETADO] AS-TASK-07: Endpoint POST /logout con token blacklist
  - Invalidación de tokens JWT mediante blacklist
  - Middleware de autenticación (`auth.middleware.js`)
  - Extracción de token desde header Authorization (Bearer)
  - Verificación de token y validación contra blacklist
  - Servicio de blacklist con almacenamiento en memoria
  - Limpieza automática de tokens expirados (cada 1 hora)
  - Logs de auditoría completos para logout
  - Principios SOLID: Single Responsibility y Separation of Concerns
- [COMPLETADO] AS-TASK-08: Definición de roles y permisos del sistema
  - Tres roles principales: gestor, profesional, directivo
  - Archivo de configuración `roles.js` con roles como constantes
  - Rol por defecto "profesional" en registro
  - Endpoint PUT /usuarios/:id/rol para cambiar roles
  - Middleware de permisos por rol (requireGestor, requireProfesional, requireDirectivo)
  - Permisos específicos por módulo (proyectos, tareas, reportes, usuarios)
  - Logs de auditoría al asignar o cambiar roles
  - Principios SOLID: config separado, middleware reutilizable
  - Endpoint GET /roles retorna roles con permisos
  - Validación de roles en toda la aplicación
- [COMPLETADO] AS-TASK-09: Middleware de autorización por rol
  - Middleware `checkRole.js` para validación de permisos granulares
  - Verificación JWT desde header Authorization (Bearer)
  - Extracción y validación de rol del payload JWT
  - Verificación de permisos por módulo y acción usando `hasPermission`
  - Respuesta 403 con detalle cuando se deniega acceso
  - Logs de auditoría completos: accesos bloqueados y autorizados
  - Helper functions: checkRoleGestor, checkRoleProfesional, checkRoleDirectivo
  - Función checkAuthentication para validar solo JWT sin permisos
  - Rutas de ejemplo en `/api/example` demostrando uso del middleware
  - Principios SOLID: Single Responsibility, separación de concerns
- [COMPLETADO] AS-TASK-10: Endpoint GET /roles/simple para listar nombres de roles
  - Endpoint simplificado GET /api/auth/roles/simple
  - Retorna array simple de nombres: { roles: ["gestor", "profesional", "directivo"] }
  - Mantiene endpoint GET /roles detallado (AS-TASK-08) sin cambios
  - Logs de auditoría para trazabilidad de consultas
  - Manejo de errores con try/catch y status HTTP 500
  - Principios SOLID: separación controller/service
- [COMPLETADO] AS-TASK-11: Endpoint PUT /usuarios/:id/rol para cambiar rol de usuario
  - Reutiliza implementación de AS-TASK-08 (no duplica código)
  - Validación de campo rol en body y :id en parámetros de ruta
  - Valida que el rol sea uno de: gestor, profesional, directivo
  - Consulta PostgreSQL para verificar existencia del usuario
  - Actualiza rol en base de datos mediante userService
  - Responde con formato JSON estandarizado (success, message, taskId: "AS-TASK-11", data)
  - Logs de auditoría completos: usuario, rol anterior, rol nuevo, timestamp
  - Manejo de errores con status HTTP 400 (validación), 404 (no encontrado), 500 (servidor)
  - Principios SOLID: controller → service → config
- [COMPLETADO] AS-TASK-12: Configurar auditoría de accesos y operaciones críticas
  - Logger centralizado (logger.js) con escritura en archivos logs/audit.log y logs/error.log
  - Middleware de auditoría (auditMiddleware.js) para registrar accesos automáticamente
  - Formato estandarizado: [OK]/[ERROR] - Timestamp - UserID - Operación - Email - IP - Detalle - taskId
  - Auditoría de operaciones críticas: REGISTER, LOGIN, LOGOUT, ROLE_CHANGE
  - Rotación automática de archivos cuando superan 10MB
  - No registra contraseñas ni tokens completos (solo metadatos seguros)
  - Logs en consola y archivo simultáneamente para trazabilidad
  - Principios SOLID: logger.js (helper) + auditMiddleware.js (middleware) separados
  - Integrado en todas las rutas protegidas mediante router.use()
  - .gitignore configurado para excluir logs/*.log pero mantener estructura
- [COMPLETADO] AS-TASK-13: Configurar sistema de logs centralizados con Winston
  - Migración de logger custom (AS-TASK-12) a Winston (librería profesional)
  - winston + winston-daily-rotate-file para rotación automática por fecha
  - Rotación diaria de logs: audit-%DATE%.log y error-%DATE%.log
  - Múltiples transportes: consola (desarrollo) + archivos rotativos (producción)
  - Niveles de log: error, warn, info, http, debug
  - Formato personalizado mantiene compatibilidad con AS-TASK-12
  - Rotación avanzada: maxSize 20MB, maxFiles 14 días (audit) / 30 días (error)
  - API pública mantenida: auditSuccess(), auditError(), logCriticalOperation(), logEndpointAccess()
  - Preparado para integración con ELK Stack, CloudWatch, Datadog
  - taskId actualizado de AS-TASK-12 a AS-TASK-13 en todos los controladores

### AS-TASK-04: Detalles del endpoint /register

**Request:**
```json
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@innovatech.cl",
  "password": "securePass123",
  "rol": "developer"
}
```

**Response exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "taskId": "AS-TASK-04",
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@innovatech.cl",
    "rol": "developer",
    "createdAt": "2026-05-11T10:30:00.000Z"
  }
}
```

**Response error - Email duplicado (400):**
```json
{
  "success": false,
  "message": "El email ya está registrado en el sistema",
  "taskId": "AS-TASK-04",
  "data": null
}
```

**Response error - Validación (400):**
```json
{
  "success": false,
  "message": "Datos de usuario inválidos",
  "taskId": "AS-TASK-04",
  "data": {
    "errors": [
      "El nombre debe tener al menos 2 caracteres",
      "Email inválido",
      "La contraseña debe tener al menos 6 caracteres"
    ]
  }
}
```

**Roles válidos:**
- `admin` - Administrador del sistema
- `user` - Usuario estándar
- `developer` - Desarrollador
- `manager` - Gestor de proyectos

**Base de datos:**
```sql
-- Ejecutar antes de probar el endpoint:
psql -U postgres -d innovatech_db -f auth/database/schema.sql
```

**Logs de auditoría:**
```
[AUTH-AUDIT] Solicitud de registro recibida - Email: juan@innovatech.cl - IP: ::1 - Timestamp: 2026-05-11T10:30:00.000Z
[UserService] Usuario creado exitosamente - ID: 1, Email: juan@innovatech.cl
[AUTH-AUDIT] [OK] Usuario registrado exitosamente - ID: 1 - Email: juan@innovatech.cl - Rol: developer - Tiempo: 145ms
```

---

### AS-TASK-05: Detalles del endpoint /login

**Request:**
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@innovatech.cl",
  "password": "securePass123"
}
```

**Response exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "taskId": "AS-TASK-05",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@innovatech.cl",
      "rol": "developer"
    }
  }
}
```

**Response error - Campos faltantes (400):**
```json
{
  "success": false,
  "message": "Email y contraseña son requeridos",
  "taskId": "AS-TASK-05",
  "data": null
}
```

**Response error - Credenciales inválidas (401):**
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "taskId": "AS-TASK-05",
  "data": null
}
```

**JWT Payload:**
```json
{
  "id": 1,
  "email": "juan@innovatech.cl",
  "rol": "developer",
  "iat": 1715425800,
  "exp": 1715512200,
  "iss": "innovatech-auth"
}
```

**Configuración JWT (.env):**
```env
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRES_IN=24h
```

**Logs de auditoría:**
```
[AUTH-AUDIT] Intento de login - Email: juan@innovatech.cl - IP: ::1 - Timestamp: 2026-05-11T14:30:00.000Z
[AUTH-AUDIT] [OK] Login exitoso - UserID: 1 - Email: juan@innovatech.cl - Rol: developer - Tiempo: 87ms - Timestamp: 2026-05-11T14:30:00.087Z
```

**Logs de auditoría - Intentos fallidos:**
```
[AUTH-AUDIT] Intento de login - Email: noexiste@innovatech.cl - IP: ::1
[AUTH-AUDIT] Login fallido - Usuario no encontrado - Email: noexiste@innovatech.cl

[AUTH-AUDIT] Intento de login - Email: juan@innovatech.cl - IP: ::1
[AUTH-AUDIT] Login fallido - Contraseña incorrecta - Email: juan@innovatech.cl - UserID: 1
```

**Testing con curl:**
```bash
# 1. Registrar un usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Pérez","email":"juan@innovatech.cl","password":"securePass123","rol":"developer"}'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@innovatech.cl","password":"securePass123"}'

# 3. Guardar el token para usar en otros endpoints
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### AS-TASK-06: Validación de credenciales y generación segura de JWT

**Mejoras implementadas:**

#### 1. Arquitectura SOLID - JWT Helper
Se creó `auth/src/utils/jwt.helper.js` para centralizar toda la lógica JWT:

```javascript
const jwtHelper = require('../utils/jwt.helper');

// Generar token
const token = jwtHelper.generateToken({ id, email, rol });

// Verificar token
const decoded = jwtHelper.verifyToken(token);

// Validar email
const isValid = jwtHelper.validateEmail(email);
```

#### 2. Métodos disponibles en JWT Helper:

| Método | Descripción |
|--------|-------------|
| `generateToken(user)` | Genera JWT firmado con payload (id, email, rol) |
| `verifyToken(token)` | Verifica y decodifica token JWT |
| `decodeToken(token)` | Decodifica sin verificar (debugging) |
| `validateEmail(email)` | Valida formato de email con regex |
| `validatePassword(password)` | Valida fortaleza de contraseña |
| `getConfig()` | Obtiene configuración JWT actual |
| `getExpirationTime()` | Calcula segundos de expiración |

#### 3. Response mejorada con expiresIn:

**Request:**
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@innovatech.cl",
  "password": "securePass123"
}
```

**Response exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "taskId": "AS-TASK-06",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@innovatech.cl",
      "rol": "developer"
    },
    "expiresIn": "1h"
  }
}
```

**Response error - Email inválido (400):**
```json
{
  "success": false,
  "message": "Formato de email inválido",
  "taskId": "AS-TASK-06",
  "data": null
}
```

#### 4. Configuración JWT mejorada (.env):

```env
# AS-TASK-06: JWT Configuration
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRES_IN=1h
JWT_ISSUER=innovatech-auth
```

**Valores permitidos para JWT_EXPIRES_IN:**
- `60s` - 60 segundos
- `5m` - 5 minutos
- `1h` - 1 hora (recomendado)
- `24h` - 24 horas
- `7d` - 7 días

#### 5. Logs mejorados con información de expiración:

```
[JWT-HELPER] Token generado - UserID: 1 - Email: juan@innovatech.cl - Expira: 1h
[AUTH-AUDIT] [OK] Login exitoso - UserID: 1 - Email: juan@innovatech.cl - Rol: developer - Expira: 1h - Tiempo: 87ms
```

#### 6. Manejo de errores JWT:

```javascript
// Token expirado
{
  "success": false,
  "message": "Token expirado",
  "taskId": "AS-TASK-06"
}

// Token inválido
{
  "success": false,
  "message": "Token inválido",
  "taskId": "AS-TASK-06"
}
```

#### 7. Testing con JWT Helper:

```bash
# 1. Login con validación mejorada
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@innovatech.cl","password":"securePass123"}'

# 2. Verificar que el response incluye expiresIn
# Response debe incluir: "expiresIn": "1h"
```

#### 8. Principios SOLID aplicados:

- **Single Responsibility**: JWT Helper solo maneja operaciones JWT
- **Open/Closed**: Fácil extender con nuevos métodos sin modificar existentes
- **Dependency Inversion**: Controller depende de abstracción (helper), no de implementación directa
- **Separation of Concerns**: Lógica JWT separada del controller

---

### AS-TASK-07: Endpoint POST /logout con token blacklist

**Objetivo**: Implementar cierre de sesión mediante invalidación de tokens JWT usando un sistema de blacklist.

#### 1. Endpoint de logout:

```http
POST http://localhost:3000/api/auth/logout
Authorization: Bearer <tu_token_jwt>
Content-Type: application/json
```

**Request Headers (obligatorio):**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Exitoso (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente. Token invalidado.",
  "taskId": "AS-TASK-07",
  "data": {
    "userId": 1,
    "email": "juan@innovatech.cl",
    "logoutAt": "2024-01-15T10:30:45.123Z"
  }
}
```

**Response Error - Token no proporcionado (401):**
```json
{
  "success": false,
  "message": "Token no proporcionado. Formato: Authorization: Bearer <token>",
  "taskId": "AS-TASK-07"
}
```

**Response Error - Token en blacklist (401):**
```json
{
  "success": false,
  "message": "Token inválido o sesión cerrada",
  "taskId": "AS-TASK-07"
}
```

**Response Error - Token expirado (401):**
```json
{
  "success": false,
  "message": "Token expirado",
  "taskId": "AS-TASK-07"
}
```

#### 2. Arquitectura implementada:

**Servicio de Blacklist (`token.blacklist.service.js`):**
- Almacenamiento en memoria usando `Set` y `Map`
- Métodos: `addToBlacklist()`, `isBlacklisted()`, `getBlacklistInfo()`
- Limpieza automática de tokens expirados cada 1 hora
- Estadísticas de blacklist: `getStats()`
- Pattern Singleton para instancia única

**Middleware de Autenticación (`auth.middleware.js`):**
- `extractToken()`: Extrae token del header Authorization (Bearer)
- `verifyToken()`: Valida token JWT y verifica blacklist
- `verifyRole()`: Middleware para verificar roles específicos
- Agrega `req.user` y `req.token` al request

**Controller actualizado:**
- Logout usa middleware `verifyToken` automáticamente
- Token ya viene extraído y validado en `req.token`
- Usuario autenticado disponible en `req.user`

#### 3. Flujo de logout:

```
1. Cliente envía POST /logout con Authorization header
   ↓
2. Middleware extractToken() extrae el token del header
   ↓
3. Middleware verifyToken() valida el token
   ↓
4. Middleware verifica si token está en blacklist
   ↓
5. Controller logout() recibe req.token y req.user
   ↓
6. Token se agrega a blacklist
   ↓
7. Respuesta exitosa con confirmación
```

#### 4. Testing completo:

```bash
# Paso 1: Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Maria Lopez",
    "email": "maria@innovatech.cl",
    "password": "secure123",
    "rol": "developer"
  }'

# Paso 2: Login y obtener token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@innovatech.cl",
    "password": "secure123"
  }'

# Respuesta incluye token JWT:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "usuario": {...},
#     "expiresIn": "1h"
#   }
# }

# Paso 3: Logout con token (guardar el token del paso 2)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Paso 4: Intentar usar el mismo token nuevamente (debe fallar)
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Resultado esperado: Error 401 - "Token inválido o sesión cerrada"
```

#### 5. Logs de auditoría:

```
[AUTH-AUDIT] Solicitud de logout - UserID: 1 - Email: maria@innovatech.cl - IP: ::1 - Timestamp: 2024-01-15T10:30:45.123Z
[BLACKLIST] Token agregado - UserID: 1 - Email: maria@innovatech.cl - Expira: 2024-01-15T11:30:45.123Z
[AUTH-AUDIT] [OK] Logout exitoso - UserID: 1 - Email: maria@innovatech.cl - Token invalidado - Tiempo: 15ms - Timestamp: 2024-01-15T10:30:45.138Z

# Intento de reutilizar token en blacklist:
[AUTH-MIDDLEWARE] Token en blacklist rechazado - Invalidado: 2024-01-15T10:30:45.138Z
```

#### 6. Blacklist Service - Características:

| Característica | Implementación |
|---------------|----------------|
| Almacenamiento | `Set` (memoria) |
| Metadata | `Map` con userId, email, rol, timestamps |
| Limpieza automática | Cada 1 hora (tokens expirados) |
| Singleton | Instancia única compartida |
| Métodos públicos | add, isBlacklisted, getInfo, getStats, clearAll |

#### 7. Middleware - Métodos disponibles:

| Método | Descripción | Uso |
|--------|-------------|-----|
| `extractToken(req)` | Extrae token del header Authorization | Interno |
| `verifyToken(req, res, next)` | Middleware de autenticación completo | `router.post('/logout', verifyToken, logout)` |
| `verifyRole(roles)` | Middleware para verificar roles | `router.get('/admin', verifyToken, verifyRole(['admin']), adminHandler)` |

#### 8. Principios SOLID aplicados:

- **Single Responsibility**:
  - `token.blacklist.service.js`: Solo gestiona blacklist
  - `auth.middleware.js`: Solo valida y extrae tokens
  - `auth.controller.js`: Solo maneja lógica de endpoints
  
- **Separation of Concerns**:
  - Blacklist separado del controller
  - Middleware separado de la lógica de negocio
  - Cada capa tiene una responsabilidad clara

- **Dependency Injection**:
  - Controller no conoce implementación de blacklist
  - Middleware inyectado en rutas

#### 9. Diferencias con sesiones tradicionales:

| Aspecto | Sesiones (cookies) | JWT + Blacklist |
|---------|-------------------|-----------------|
| Almacenamiento | Servidor (memoria/Redis) | Cliente (token) + Blacklist |
| Invalidación | Eliminar del store | Agregar a blacklist |
| Escalabilidad | Requiere store compartido | Stateless + blacklist |
| Performance | Consulta BD en cada request | Solo verifica blacklist |

#### 10. Consideraciones de producción:

**Para producción se recomienda:**
- Migrar blacklist de memoria a **Redis** (distribución entre instancias)
- Implementar TTL automático en Redis (tokens expirados se eliminan solos)
- Monitorear tamaño de blacklist
- Logs centralizados (ELK, CloudWatch)
- Rate limiting en endpoints de autenticación

**Ejemplo migración a Redis:**
```javascript
// Futuro: Usar Redis en lugar de Set
const redis = require('redis');
const client = redis.createClient();

addToBlacklist(token) {
  const expiresIn = this.getTokenExpiration(token);
  client.setex(token, expiresIn, 'blacklisted');
}

isBlacklisted(token) {
  return client.exists(token);
}
```

---

### AS-TASK-08: Definición de roles y permisos del sistema

**Objetivo**: Implementar sistema de roles y permisos con tres roles principales: gestor, profesional y directivo.

#### 1. Roles definidos en el sistema:

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **gestor** | Gestor de proyectos | Crear/editar proyectos, asignar tareas, ver reportes |
| **profesional** | Profesional técnico | Ver y actualizar tareas asignadas, ver proyectos |
| **directivo** | Directivo ejecutivo | Consultar KPIs, analytics y reportes, ver proyectos y tareas |

#### 2. Endpoint GET /roles - Obtener roles disponibles:

```http
GET http://localhost:3000/api/auth/roles
```

**Response (200):**
```json
{
  "success": true,
  "message": "Roles obtenidos exitosamente",
  "taskId": "AS-TASK-08",
  "data": [
    {
      "id": 1,
      "nombre": "gestor",
      "descripcion": "Gestor de proyectos - Puede crear y editar proyectos",
      "permisos": {
        "proyectos": ["crear", "editar", "eliminar", "ver"],
        "tareas": ["ver", "asignar", "actualizar"],
        "reportes": ["ver"],
        "usuarios": ["ver"]
      }
    },
    {
      "id": 2,
      "nombre": "profesional",
      "descripcion": "Profesional técnico - Puede ver y actualizar tareas asignadas",
      "permisos": {
        "proyectos": ["ver"],
        "tareas": ["ver", "actualizar"],
        "reportes": [],
        "usuarios": []
      }
    },
    {
      "id": 3,
      "nombre": "directivo",
      "descripcion": "Directivo - Puede consultar KPIs y reportes",
      "permisos": {
        "proyectos": ["ver"],
        "tareas": ["ver"],
        "reportes": ["ver", "kpis", "analytics"],
        "usuarios": ["ver"]
      }
    }
  ]
}
```

#### 3. Registro con rol por defecto:

**Ahora el campo "rol" es OPCIONAL en el registro:**

```bash
# Registro SIN especificar rol (asigna "profesional" por defecto)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Maria Lopez",
    "email": "maria@innovatech.cl",
    "password": "secure123"
  }'

# Response asigna rol "profesional" automáticamente
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "taskId": "AS-TASK-08",
  "data": {
    "id": 5,
    "nombre": "Maria Lopez",
    "email": "maria@innovatech.cl",
    "rol": "profesional",
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}

# Registro especificando rol
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos Ruiz",
    "email": "carlos@innovatech.cl",
    "password": "secure123",
    "rol": "gestor"
  }'
```

**Logs del registro con rol por defecto:**
```
[AUTH-AUDIT] Rol no especificado, asignando rol por defecto: profesional
[AUTH-AUDIT] Solicitud de registro recibida - Email: maria@innovatech.cl - Rol: profesional - IP: ::1 - Timestamp: 2024-01-15T12:00:00.000Z
```

#### 4. Endpoint PUT /usuarios/:id/rol - Actualizar rol de usuario:

```http
PUT http://localhost:3000/api/auth/usuarios/5/rol
Content-Type: application/json
```

**Request Body:**
```json
{
  "rol": "gestor"
}
```

**Response Exitoso (200):**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente de \"profesional\" a \"gestor\"",
  "taskId": "AS-TASK-08",
  "data": {
    "id": 5,
    "nombre": "Maria Lopez",
    "email": "maria@innovatech.cl",
    "rolAnterior": "profesional",
    "rolNuevo": "gestor",
    "descripcion": "Gestor de proyectos - Puede crear y editar proyectos",
    "updatedAt": "2024-01-15T12:30:00.000Z"
  }
}
```

**Response Error - Usuario no encontrado (404):**
```json
{
  "success": false,
  "message": "Usuario no encontrado",
  "taskId": "AS-TASK-08",
  "data": null
}
```

**Response Error - Rol inválido (500):**
```json
{
  "success": false,
  "message": "Error interno del servidor al actualizar rol",
  "error": "Rol inválido. Valores permitidos: gestor, profesional, directivo",
  "taskId": "AS-TASK-08"
}
```

#### 5. Logs de auditoría para cambio de roles:

```
[AUTH-AUDIT] Solicitud de actualización de rol - UserID: 5 - Nuevo rol: gestor - IP: ::1 - Timestamp: 2024-01-15T12:30:00.000Z
[UserService] Rol actualizado - UserID: 5 - Nuevo rol: gestor
[AUTH-AUDIT] [OK] Rol actualizado exitosamente - UserID: 5 - Email: maria@innovatech.cl - Rol anterior: profesional - Rol nuevo: gestor - Tiempo: 45ms - Timestamp: 2024-01-15T12:30:00.045Z
```

#### 6. Middlewares de permisos disponibles:

**a) `verifyToken` - Verificar autenticación:**
```javascript
// Uso básico: verificar que el usuario esté autenticado
router.get('/perfil', verifyToken, getPerfil);
```

**b) `verifyRole(roles)` - Verificar roles específicos:**
```javascript
// Solo admins pueden acceder
router.delete('/usuarios/:id', verifyToken, verifyRole(['admin']), deleteUser);
```

**c) `requireGestor` - Solo gestor:**
```javascript
// Solo gestor puede crear proyectos
router.post('/proyectos', verifyToken, requireGestor, createProject);
router.put('/proyectos/:id', verifyToken, requireGestor, editProject);
```

**d) `requireProfesional` - Solo profesional:**
```javascript
// Solo profesional puede actualizar sus tareas
router.put('/tareas/:id', verifyToken, requireProfesional, updateTask);
```

**e) `requireDirectivo` - Solo directivo:**
```javascript
// Solo directivo puede ver KPIs
router.get('/reportes/kpis', verifyToken, requireDirectivo, getKPIs);
router.get('/reportes/analytics', verifyToken, requireDirectivo, getAnalytics);
```

**f) `allowRoles(roles)` - Permitir múltiples roles:**
```javascript
// Gestor y directivo pueden ver proyectos
const { allowRoles, ROLES } = require('./middleware/auth.middleware');
router.get('/proyectos', verifyToken, allowRoles([ROLES.GESTOR, ROLES.DIRECTIVO]), getProjects);
```

**g) `requirePermission(modulo, accion)` - Permisos granulares:**
```javascript
// Verificar permiso específico: crear en módulo proyectos
router.post('/proyectos', verifyToken, requirePermission('proyectos', 'crear'), createProject);
```

#### 7. Testing completo del sistema de roles:

```bash
# Paso 1: Registrar usuario sin especificar rol (usa profesional por defecto)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana Torres",
    "email": "ana@innovatech.cl",
    "password": "secure123"
  }'

# Paso 2: Login y obtener token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana@innovatech.cl",
    "password": "secure123"
  }'

# Guardar token:
# TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Paso 3: Consultar roles disponibles
curl http://localhost:3000/api/auth/roles

# Paso 4: Cambiar rol a "gestor" (requiere admin o servicio backend)
curl -X PUT http://localhost:3000/api/auth/usuarios/6/rol \
  -H "Content-Type: application/json" \
  -d '{"rol": "gestor"}'

# Paso 5: Login nuevamente para obtener token con nuevo rol
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana@innovatech.cl",
    "password": "secure123"
  }'

# Paso 6: Probar endpoint protegido (ejemplo futuro)
# Este endpoint requiere rol "gestor"
# curl -X POST http://localhost:3000/api/proyectos \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "Content-Type: application/json" \
#   -d '{"nombre": "Proyecto Alpha", "descripcion": "..."}'
```

#### 8. Configuración de roles (`config/roles.js`):

**Estructura del archivo:**
```javascript
const ROLES = {
  GESTOR: 'gestor',
  PROFESIONAL: 'profesional',
  DIRECTIVO: 'directivo'
};

const DEFAULT_ROLE = ROLES.PROFESIONAL;

const ROLE_PERMISSIONS = {
  [ROLES.GESTOR]: {
    proyectos: ['crear', 'editar', 'eliminar', 'ver'],
    tareas: ['ver', 'asignar', 'actualizar'],
    reportes: ['ver'],
    usuarios: ['ver']
  },
  // ... otros roles
};
```

**Funciones exportadas:**
- `isValidRole(rol)` - Validar si un rol existe
- `getAllRoles()` - Obtener array de roles
- `getRoleInfo(rol)` - Información completa de un rol
- `getAllRolesInfo()` - Todos los roles con información
- `hasPermission(rol, modulo, accion)` - Verificar permiso específico
- `getRoleDescription(rol)` - Obtener descripción del rol

#### 9. Permisos por rol - Tabla de referencia:

| Módulo / Acción | Gestor | Profesional | Directivo |
|----------------|--------|-------------|-----------|
| **Proyectos** |
| - crear | [COMPLETADO] | [NO] | [NO] |
| - editar | [COMPLETADO] | [NO] | [NO] |
| - eliminar | [COMPLETADO] | [NO] | [NO] |
| - ver | [COMPLETADO] | [COMPLETADO] | [COMPLETADO] |
| **Tareas** |
| - asignar | [COMPLETADO] | [NO] | [NO] |
| - actualizar | [COMPLETADO] | [COMPLETADO] | [NO] |
| - ver | [COMPLETADO] | [COMPLETADO] | [COMPLETADO] |
| **Reportes** |
| - ver | [COMPLETADO] | [NO] | [COMPLETADO] |
| - kpis | [NO] | [NO] | [COMPLETADO] |
| - analytics | [NO] | [NO] | [COMPLETADO] |
| **Usuarios** |
| - ver | [COMPLETADO] | [NO] | [COMPLETADO] |

#### 10. Principios SOLID aplicados:

- **Single Responsibility**:
  - `config/roles.js`: Solo define roles y permisos
  - `auth.middleware.js`: Solo valida roles y permisos
  - `user.service.js`: Solo gestiona datos de usuarios
  
- **Open/Closed**:
  - Fácil agregar nuevos roles sin modificar código existente
  - Nuevos permisos se agregan en configuración
  
- **Dependency Inversion**:
  - Controllers dependen de abstracciones (userService, rolesConfig)
  - No dependen de implementaciones concretas
  
- **Separation of Concerns**:
  - Configuración separada de lógica de negocio
  - Middleware separado de controllers
  - Cada capa tiene responsabilidad única

#### 11. Ejemplo de uso en rutas:

```javascript
const express = require('express');
const router = express.Router();
const { 
  verifyToken, 
  requireGestor, 
  requireDirectivo,
  allowRoles 
} = require('./middleware/auth.middleware');
const { ROLES } = require('./config/roles');

// Público - no requiere autenticación
router.get('/health', healthCheck);

// Requiere autenticación
router.get('/perfil', verifyToken, getUserProfile);

// Solo gestor
router.post('/proyectos', verifyToken, requireGestor, createProject);
router.put('/proyectos/:id', verifyToken, requireGestor, updateProject);

// Gestor o directivo
router.get('/proyectos', verifyToken, allowRoles([ROLES.GESTOR, ROLES.DIRECTIVO]), listProjects);

// Solo directivo
router.get('/reportes/kpis', verifyToken, requireDirectivo, getKPIs);

// Solo profesional (o gestor que también puede)
router.put('/tareas/:id', verifyToken, allowRoles([ROLES.PROFESIONAL, ROLES.GESTOR]), updateTask);

module.exports = router;
```

#### 12. Migraciones futuras (base de datos):

Para migrar roles existentes en BD:
```sql
-- Actualizar roles antiguos a nuevos
UPDATE usuarios SET rol = 'gestor' WHERE rol = 'project_manager';
UPDATE usuarios SET rol = 'profesional' WHERE rol IN ('developer', 'user');
UPDATE usuarios SET rol = 'directivo' WHERE rol = 'admin';

-- Actualizar constraint de roles
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check 
  CHECK (rol IN ('gestor', 'profesional', 'directivo'));
```

#### 13. Response de middleware cuando se deniega acceso:

```json
{
  "success": false,
  "message": "Acceso denegado. Roles permitidos: gestor",
  "taskId": "AS-TASK-08"
}
```

**Con permisos granulares:**
```json
{
  "success": false,
  "message": "Acceso denegado. Su rol \"profesional\" no tiene permiso para \"crear\" en módulo \"proyectos\"",
  "taskId": "AS-TASK-08"
}
```

---

### AS-TASK-09: Middleware de autorización por rol

**Descripción:** Middleware de autorización que verifica que el usuario tenga los permisos necesarios (basados en su rol) para acceder a un endpoint específico.

**Diferencia con AS-TASK-08:**
- **AS-TASK-08**: Define roles y permisos en configuración + middleware básico de verificación de roles
- **AS-TASK-09**: Middleware avanzado que verifica **permisos granulares** (módulo + acción) extrayendo el rol desde el JWT

**Archivo:** `auth/src/middleware/checkRole.js`

#### 1. Funciones principales del middleware:

**a) `checkRole(moduloRequerido, accionRequerida)`**
- Middleware factory que retorna una función middleware
- Extrae token JWT del header `Authorization: Bearer <token>`
- Verifica el token con `JWT_SECRET` de `.env`
- Extrae el rol del usuario del payload JWT
- Valida permisos usando `hasPermission(rol, modulo, accion)` de `config/roles.js`
- Retorna 403 si el rol no tiene permisos
- Agrega `req.user` y `req.token` si el permiso es válido
- Logs de auditoría completos

**b) `checkRoleGestor`**
- Helper: `checkRole('proyectos', 'crear')`
- Valida que el usuario sea gestor con permiso de crear proyectos

**c) `checkRoleProfesional`**
- Helper: `checkRole('tareas', 'actualizar')`
- Valida que el usuario sea profesional con permiso de actualizar tareas

**d) `checkRoleDirectivo`**
- Helper: `checkRole('reportes', 'kpis')`
- Valida que el usuario sea directivo con permiso de ver KPIs

**e) `checkAuthentication()`**
- Middleware que solo verifica JWT válido
- No valida permisos específicos
- Útil para endpoints que solo requieren estar autenticado

**f) `getRequiredRolesForAction(modulo, accion)`**
- Helper que retorna array de roles que tienen permiso para una acción
- Usado en response 403 para informar al cliente qué roles pueden acceder

#### 2. Ejemplo de uso básico:

```javascript
const express = require('express');
const router = express.Router();
const { checkRole, checkRoleGestor } = require('../middleware/checkRole');

// Opción 1: Usar helper predefinido
router.post('/proyectos', checkRoleGestor, createProject);

// Opción 2: Usar checkRole con módulo y acción específicos
router.put('/proyectos/:id', checkRole('proyectos', 'editar'), editProject);

// Opción 3: Verificar solo autenticación (sin permisos específicos)
router.get('/perfil', checkAuthentication(), getUserProfile);

module.exports = router;
```

#### 3. Endpoints de ejemplo (`/api/example`):

El proyecto incluye rutas de ejemplo en `auth/src/routes/example.routes.js` para demostrar el uso del middleware:

**a) Proyectos:**
```bash
# POST /api/example/proyectos - Solo gestor
curl -X POST http://localhost:3000/api/example/proyectos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Proyecto Alpha"}'

# PUT /api/example/proyectos/:id - Solo gestor
curl -X PUT http://localhost:3000/api/example/proyectos/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Proyecto Beta"}'

# GET /api/example/proyectos - Todos los roles autenticados
curl http://localhost:3000/api/example/proyectos \
  -H "Authorization: Bearer $TOKEN"
```

**b) Tareas:**
```bash
# GET /api/example/tareas - Todos los roles autenticados
curl http://localhost:3000/api/example/tareas \
  -H "Authorization: Bearer $TOKEN"

# PUT /api/example/tareas/:id - Solo profesional o gestor
curl -X PUT http://localhost:3000/api/example/tareas/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estado": "completado"}'

# POST /api/example/tareas/:id/asignar - Solo gestor
curl -X POST http://localhost:3000/api/example/tareas/1/asignar \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"usuarioId": 5}'
```

**c) Reportes y KPIs:**
```bash
# GET /api/example/reportes - Solo directivo
curl http://localhost:3000/api/example/reportes \
  -H "Authorization: Bearer $TOKEN"

# GET /api/example/reportes/kpis - Solo directivo
curl http://localhost:3000/api/example/reportes/kpis \
  -H "Authorization: Bearer $TOKEN"

# GET /api/example/reportes/analytics - Solo directivo
curl http://localhost:3000/api/example/reportes/analytics \
  -H "Authorization: Bearer $TOKEN"
```

**d) Endpoints de prueba:**
```bash
# GET /api/example/test/auth - Solo verifica autenticación (cualquier rol)
curl http://localhost:3000/api/example/test/auth \
  -H "Authorization: Bearer $TOKEN"

# GET /api/example/test/public - Endpoint público (no requiere token)
curl http://localhost:3000/api/example/test/public
```

#### 4. Responses del middleware:

**Success (200):**
```json
{
  "success": true,
  "message": "Proyecto creado exitosamente (EJEMPLO)",
  "taskId": "AS-TASK-09",
  "data": {
    "proyecto": {
      "id": 1,
      "nombre": "Proyecto ejemplo",
      "createdBy": "gestor@innovatech.cl",
      "rol": "gestor"
    }
  }
}
```

**Error - Token no proporcionado (401):**
```json
{
  "success": false,
  "message": "Token no proporcionado. Debe incluir header Authorization: Bearer <token>",
  "taskId": "AS-TASK-09",
  "data": {}
}
```

**Error - Formato de token inválido (401):**
```json
{
  "success": false,
  "message": "Formato de token inválido. Use: Authorization: Bearer <token>",
  "taskId": "AS-TASK-09",
  "data": {}
}
```

**Error - Token expirado (401):**
```json
{
  "success": false,
  "message": "Token expirado. Por favor inicie sesión nuevamente",
  "taskId": "AS-TASK-09",
  "data": {}
}
```

**Error - Token inválido (401):**
```json
{
  "success": false,
  "message": "Token inválido",
  "taskId": "AS-TASK-09",
  "data": {}
}
```

**Error - Acceso denegado por falta de permisos (403):**
```json
{
  "success": false,
  "message": "Acceso denegado. Su rol \"profesional\" no tiene permiso para \"crear\" en el módulo \"proyectos\"",
  "taskId": "AS-TASK-09",
  "data": {
    "rolActual": "profesional",
    "moduloRequerido": "proyectos",
    "accionRequerida": "crear",
    "permisosNecesarios": ["gestor"]
  }
}
```

**Error - Error interno (500):**
```json
{
  "success": false,
  "message": "Error interno al verificar permisos",
  "taskId": "AS-TASK-09",
  "data": {
    "error": "Descripción del error"
  }
}
```

#### 5. Logs de auditoría:

**Acceso autorizado:**
```
[AUTHORIZATION-AUDIT] [OK] Acceso AUTORIZADO - UserID: 5 - Email: gestor@innovatech.cl - Rol: gestor - Módulo: proyectos - Acción: crear - Endpoint: POST /api/example/proyectos - Tiempo: 12ms - Timestamp: 2024-01-15T14:30:00.000Z
```

**Acceso bloqueado por falta de permisos:**
```
[AUTHORIZATION-AUDIT] [ERROR] Acceso BLOQUEADO - UserID: 7 - Email: profesional@innovatech.cl - Rol: profesional - Módulo: proyectos - Acción: crear - Endpoint: POST /api/example/proyectos - IP: ::1 - Tiempo: 8ms - Timestamp: 2024-01-15T14:31:00.000Z
```

**Token no proporcionado:**
```
[AUTHORIZATION-AUDIT] Acceso denegado - No hay token - IP: ::1 - Endpoint: POST /api/example/proyectos - Timestamp: 2024-01-15T14:32:00.000Z
```

**Token inválido/expirado:**
```
[AUTHORIZATION-AUDIT] Acceso denegado - Token inválido/expirado - Error: jwt expired - IP: ::1 - Timestamp: 2024-01-15T14:33:00.000Z
```

**Error en middleware:**
```
[AUTHORIZATION-AUDIT] [ERROR] Error en middleware de autorización - Error: Cannot read property 'rol' of undefined - Endpoint: POST /api/example/proyectos - IP: ::1 - Timestamp: 2024-01-15T14:34:00.000Z
```

#### 6. Testing completo:

**Paso 1: Registrar usuarios con diferentes roles**
```bash
# Usuario gestor
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos Gestor",
    "email": "gestor@innovatech.cl",
    "password": "secure123"
  }'

# Usuario profesional
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Maria Profesional",
    "email": "profesional@innovatech.cl",
    "password": "secure123"
  }'

# Usuario directivo
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Directivo",
    "email": "directivo@innovatech.cl",
    "password": "secure123"
  }'
```

**Paso 2: Asignar roles (usando endpoint PUT /usuarios/:id/rol)**
```bash
# Cambiar rol a "gestor"
curl -X PUT http://localhost:3000/api/auth/usuarios/1/rol \
  -H "Content-Type: application/json" \
  -d '{"rol": "gestor"}'

# Cambiar rol a "directivo"
curl -X PUT http://localhost:3000/api/auth/usuarios/3/rol \
  -H "Content-Type: application/json" \
  -d '{"rol": "directivo"}'
```

**Paso 3: Login y obtener tokens**
```bash
# Login como gestor
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "gestor@innovatech.cl", "password": "secure123"}'
# Guardar: TOKEN_GESTOR="..."

# Login como profesional
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "profesional@innovatech.cl", "password": "secure123"}'
# Guardar: TOKEN_PROFESIONAL="..."

# Login como directivo
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "directivo@innovatech.cl", "password": "secure123"}'
# Guardar: TOKEN_DIRECTIVO="..."
```

**Paso 4: Probar permisos**
```bash
# [COMPLETADO] GESTOR puede crear proyectos
curl -X POST http://localhost:3000/api/example/proyectos \
  -H "Authorization: Bearer $TOKEN_GESTOR" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Proyecto Alpha"}'

# [NO] PROFESIONAL NO puede crear proyectos (403)
curl -X POST http://localhost:3000/api/example/proyectos \
  -H "Authorization: Bearer $TOKEN_PROFESIONAL" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Proyecto Beta"}'

# [COMPLETADO] PROFESIONAL puede actualizar tareas
curl -X PUT http://localhost:3000/api/example/tareas/1 \
  -H "Authorization: Bearer $TOKEN_PROFESIONAL" \
  -H "Content-Type: application/json" \
  -d '{"estado": "completado"}'

# [NO] PROFESIONAL NO puede ver KPIs (403)
curl http://localhost:3000/api/example/reportes/kpis \
  -H "Authorization: Bearer $TOKEN_PROFESIONAL"

# [COMPLETADO] DIRECTIVO puede ver KPIs
curl http://localhost:3000/api/example/reportes/kpis \
  -H "Authorization: Bearer $TOKEN_DIRECTIVO"

# [COMPLETADO] Todos los roles autenticados pueden ver proyectos
curl http://localhost:3000/api/example/proyectos \
  -H "Authorization: Bearer $TOKEN_PROFESIONAL"
```

**Paso 5: Probar casos de error**
```bash
# Sin token (401)
curl -X POST http://localhost:3000/api/example/proyectos \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Proyecto"}'

# Token malformado (401)
curl -X POST http://localhost:3000/api/example/proyectos \
  -H "Authorization: INVALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Proyecto"}'

# Endpoint público (no requiere token)
curl http://localhost:3000/api/example/test/public
```

#### 7. Integración con rutas existentes:

Para proteger rutas existentes, simplemente agregar el middleware:

```javascript
// Antes (sin autorización)
router.post('/proyectos', createProject);

// Después (con autorización)
const { checkRoleGestor } = require('../middleware/checkRole');
router.post('/proyectos', checkRoleGestor, createProject);
```

**Ejemplos de integración:**

```javascript
// auth/src/routes/auth.routes.js
const { checkRole } = require('../middleware/checkRole');

// Proteger endpoint de cambio de rol (solo admin futuro)
router.put('/usuarios/:id/rol', 
  checkRole('usuarios', 'editar'), 
  authController.updateUserRole
);

// Endpoint de roles puede ser público o requiere autenticación
router.get('/roles', 
  checkAuthentication(), 
  authController.getRoles
);
```

#### 8. Principios SOLID aplicados:

**Single Responsibility:**
- `checkRole.js`: Solo se encarga de autorización por permisos
- `auth.middleware.js`: Solo se encarga de autenticación y roles básicos
- `config/roles.js`: Solo define roles y permisos

**Open/Closed:**
- Fácil agregar nuevos módulos y acciones sin modificar middleware
- Nuevos helpers se crean reutilizando `checkRole()`

**Dependency Inversion:**
- Middleware depende de abstracción (`hasPermission` de config)
- No depende de implementación concreta de permisos

**Separation of Concerns:**
- JWT verification separada de validación de permisos
- Logs de auditoría centralizados
- Respuestas estandarizadas con taskId

**Reusability:**
- `checkRole()` es reutilizable para cualquier módulo/acción
- Helpers predefinidos para casos comunes
- `getRequiredRolesForAction()` helper para informes

#### 9. Diferencia entre middlewares:

| Middleware | Propósito | Validación | Uso |
|------------|-----------|------------|-----|
| `auth.middleware.js` | Autenticación + Roles básicos | JWT + blacklist + roles fijos | Verificar autenticación, roles específicos |
| `checkRole.js` | Autorización granular | JWT + permisos por módulo/acción | Verificar permisos específicos (módulo + acción) |
| `checkAuthentication()` | Solo autenticación | JWT válido | Endpoints que solo requieren estar logueado |

**Cuándo usar cada uno:**

- **`verifyToken`** (auth.middleware.js): Autenticar usuario, agregar req.user
- **`verifyRole(['gestor'])`** (auth.middleware.js): Verificar rol específico sin permisos granulares
- **`checkRole('proyectos', 'crear')`** (checkRole.js): Verificar permiso específico en módulo
- **`checkRoleGestor`** (checkRole.js): Helper rápido para permiso común de gestor
- **`checkAuthentication()`** (checkRole.js): Solo verificar JWT válido

#### 10. Estructura de archivos:

```
auth/
├── src/
│   ├── middleware/
│   │   ├── auth.middleware.js      (AS-TASK-07, AS-TASK-08)
│   │   └── checkRole.js            (AS-TASK-09) ← NUEVO
│   ├── config/
│   │   └── roles.js                (AS-TASK-08)
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── example.routes.js       (AS-TASK-09) ← NUEVO
│   └── app.js                      (actualizado con /api/example)
```

#### 11. Variables de entorno requeridas:

```env
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=1h
JWT_ISSUER=innovatech-auth
```

El middleware utiliza `JWT_SECRET` para verificar tokens. Si no está definida, usa valor por defecto `secret_key_default_CHANGE_THIS`.

#### 12. Siguientes pasos recomendados:

1. **Integrar checkRole en rutas reales**: Agregar middleware a endpoints de proyectos, tareas, reportes
2. **Persistir permisos en BD**: Mover ROLE_PERMISSIONS de memoria a tabla `permisos`
3. **Agregar permisos dinámicos**: Permitir cambiar permisos sin modificar código
4. **Rate limiting por rol**: Límites diferentes según rol del usuario
5. **Logs en BD**: Guardar logs de auditoría en tabla `audit_logs`
6. **Dashboard de auditoría**: Interfaz para ver accesos bloqueados/autorizados

---

### AS-TASK-10: Endpoint GET /roles/simple para listar nombres de roles

**Descripción:** Endpoint simplificado que retorna únicamente un array de nombres de roles disponibles en el sistema, sin información adicional como permisos o descripciones.

**Diferencia con AS-TASK-08:**
- **AS-TASK-08**: GET /roles retorna información **detallada** (id, nombre, descripción, permisos)
- **AS-TASK-10**: GET /roles/simple retorna **solo nombres** en array simple

**Endpoints:**
- `GET /api/auth/roles` (AS-TASK-08) - Información detallada de roles
- `GET /api/auth/roles/simple` (AS-TASK-10) - Solo nombres de roles ← **NUEVO**

**Archivo:** `auth/src/controllers/auth.controller.js` (método `getRolesSimple`)

#### 1. Endpoint GET /roles/simple:

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/roles/simple
```

**Response exitoso (200):**
```json
{
  "success": true,
  "message": "Roles disponibles",
  "taskId": "AS-TASK-10",
  "data": {
    "roles": ["gestor", "profesional", "directivo"]
  }
}
```

**Response error (500):**
```json
{
  "success": false,
  "message": "Error al obtener roles",
  "error": "Mensaje de error detallado",
  "taskId": "AS-TASK-10"
}
```

#### 2. Implementación en controller:

```javascript
/**
 * GET /roles/simple - Listar solo nombres de roles (formato simplificado)
 * AS-TASK-10: Endpoint simplificado que retorna solo array de nombres
 */
const getRolesSimple = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Log de auditoría: Inicio de consulta
    console.log(`[AUTH-AUDIT] Consulta de roles simplificados - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);
    
    // Obtener roles desde configuración
    const rolesArray = getAllRoles(); // ["gestor", "profesional", "directivo"]
    
    const responseTime = Date.now() - startTime;
    
    // Log de auditoría: Consulta exitosa
    console.log(`[AUTH-AUDIT] [OK] Roles simplificados obtenidos exitosamente - Total: ${rolesArray.length} roles - Tiempo: ${responseTime}ms - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: 'Roles disponibles',
      taskId: 'AS-TASK-10',
      data: {
        roles: rolesArray
      }
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Log de auditoría: Error
    console.error(`[AUTH-AUDIT] [ERROR] Error al obtener roles simplificados - Error: ${error.message} - Tiempo: ${responseTime}ms - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);
    
    res.status(500).json({
      success: false,
      message: 'Error al obtener roles',
      error: error.message,
      taskId: 'AS-TASK-10'
    });
  }
};
```

#### 3. Configuración de ruta:

**Archivo:** `auth/src/routes/auth.routes.js`

```javascript
// Endpoints de roles
router.get('/roles', authController.getRoles); // AS-TASK-08: Info detallada
router.get('/roles/simple', authController.getRolesSimple); // AS-TASK-10: Solo nombres
router.put('/usuarios/:id/rol', authController.updateUserRole);
```

**Nota importante sobre orden de rutas:**
- `/roles/simple` debe estar **antes** de `/roles/:id` (si existiera) para evitar que "simple" sea interpretado como un ID
- En este caso está bien porque no hay `/roles/:id`

#### 4. Logs de auditoría:

**Consulta exitosa:**
```
[AUTH-AUDIT] Consulta de roles simplificados - IP: ::1 - Timestamp: 2024-01-15T15:00:00.000Z
[AUTH-AUDIT] [OK] Roles simplificados obtenidos exitosamente - Total: 3 roles - Tiempo: 2ms - IP: ::1 - Timestamp: 2024-01-15T15:00:00.002Z
```

**Error al obtener roles:**
```
[AUTH-AUDIT] Consulta de roles simplificados - IP: ::1 - Timestamp: 2024-01-15T15:01:00.000Z
[AUTH-AUDIT] [ERROR] Error al obtener roles simplificados - Error: Cannot read property 'map' of undefined - Tiempo: 1ms - IP: ::1 - Timestamp: 2024-01-15T15:01:00.001Z
```

#### 5. Testing:

**Test 1: Consulta exitosa**
```bash
curl -X GET http://localhost:3000/api/auth/roles/simple

# Response esperado:
{
  "success": true,
  "message": "Roles disponibles",
  "taskId": "AS-TASK-10",
  "data": {
    "roles": ["gestor", "profesional", "directivo"]
  }
}
```

**Test 2: Comparación con endpoint detallado**
```bash
# Endpoint simplificado (AS-TASK-10)
curl -X GET http://localhost:3000/api/auth/roles/simple

# Endpoint detallado (AS-TASK-08)
curl -X GET http://localhost:3000/api/auth/roles
```

**Salida comparativa:**

**GET /roles/simple** (AS-TASK-10):
```json
{
  "success": true,
  "message": "Roles disponibles",
  "taskId": "AS-TASK-10",
  "data": {
    "roles": ["gestor", "profesional", "directivo"]
  }
}
```

**GET /roles** (AS-TASK-08):
```json
{
  "success": true,
  "message": "Roles obtenidos exitosamente",
  "taskId": "AS-TASK-08",
  "data": [
    {
      "id": 1,
      "nombre": "gestor",
      "descripcion": "Gestiona proyectos y recursos del sistema",
      "permisos": {
        "proyectos": ["crear", "editar", "eliminar", "ver"],
        "tareas": ["ver", "asignar", "actualizar"],
        "reportes": ["ver"],
        "usuarios": ["ver"]
      }
    },
    {
      "id": 2,
      "nombre": "profesional",
      "descripcion": "Profesional que ejecuta tareas asignadas",
      "permisos": {
        "proyectos": ["ver"],
        "tareas": ["ver", "actualizar"],
        "reportes": [],
        "usuarios": []
      }
    },
    {
      "id": 3,
      "nombre": "directivo",
      "descripcion": "Directivo con acceso a reportes y KPIs",
      "permisos": {
        "proyectos": ["ver"],
        "tareas": ["ver"],
        "reportes": ["ver", "kpis", "analytics"],
        "usuarios": ["ver"]
      }
    }
  ]
}
```

#### 6. Casos de uso:

**Cuándo usar GET /roles/simple:**
- Frontend necesita solo nombres para dropdowns/selects
- Integración con sistemas externos que solo necesitan identificadores
- Listados simples de roles disponibles
- Reducir tamaño de payload cuando no se necesita info adicional

**Cuándo usar GET /roles (detallado):**
- Frontend necesita mostrar descripciones de roles
- Se requiere información de permisos para UI
- Documentación o ayuda contextual
- Administración de roles y permisos

#### 7. Principios SOLID aplicados:

**Single Responsibility:**
- `getRolesSimple()` tiene una única responsabilidad: retornar nombres de roles
- Separado de `getRoles()` que retorna información completa
- No mezcla lógicas diferentes

**Open/Closed:**
- Fácil agregar nuevos formatos de respuesta sin modificar existentes
- Extensible a otros endpoints simplificados (ej: /usuarios/simple)

**Dependency Inversion:**
- Usa `getAllRoles()` de config/roles.js (abstracción)
- No depende de implementación concreta

**DRY (Don't Repeat Yourself):**
- Reutiliza `getAllRoles()` existente de config
- No duplica lógica de obtención de roles

**Separation of Concerns:**
- Controller solo maneja HTTP request/response
- Config maneja definición de roles
- Logs centralizados con formato consistente

#### 8. Integración con frontend:

**React example:**
```javascript
// Obtener solo nombres de roles para dropdown
const fetchRolesSimple = async () => {
  const response = await fetch('/api/auth/roles/simple');
  const data = await response.json();
  
  if (data.success) {
    return data.data.roles; // ["gestor", "profesional", "directivo"]
  }
};

// Uso en componente
<select>
  {roles.map(rol => (
    <option key={rol} value={rol}>{rol}</option>
  ))}
</select>
```

**Angular example:**
```typescript
// Service
getRolesSimple(): Observable<string[]> {
  return this.http.get<ApiResponse>('/api/auth/roles/simple')
    .pipe(
      map(response => response.data.roles)
    );
}

// Component
this.rolesService.getRolesSimple().subscribe(roles => {
  this.availableRoles = roles;
});
```

#### 9. Ventajas del endpoint simplificado:

| Aspecto | GET /roles (detallado) | GET /roles/simple |
|---------|------------------------|-------------------|
| **Tamaño payload** | ~800 bytes | ~150 bytes |
| **Tiempo de respuesta** | ~15ms | ~2ms |
| **Complejidad** | Media | Baja |
| **Uso frontend** | Administración, detalles | Dropdowns, filtros |
| **Cacheable** | Sí | Sí (más eficiente) |

#### 10. Estructura de archivos actualizada:

```
auth/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js      (getRoles, getRolesSimple) ← ACTUALIZADO
│   ├── routes/
│   │   └── auth.routes.js          (GET /roles/simple) ← ACTUALIZADO
│   ├── config/
│   │   └── roles.js                (getAllRoles())
│   └── app.js
```

#### 11. Endpoints de roles disponibles:

| Endpoint | Método | Descripción | AS-TASK | Response |
|----------|--------|-------------|---------|----------|
| `/api/auth/roles` | GET | Info detallada de roles | AS-TASK-08 | Array de objetos con id, nombre, descripción, permisos |
| `/api/auth/roles/simple` | GET | Solo nombres de roles | AS-TASK-10 | Objeto con array de strings |
| `/api/auth/usuarios/:id/rol` | PUT | Cambiar rol de usuario | AS-TASK-08 | Confirmación de cambio |

#### 12. Mejoras futuras sugeridas:

1. **Cache de roles**: Implementar cache para reducir consultas a config
2. **Versioning**: `/api/v1/auth/roles/simple` para compatibilidad futura
3. **Query params**: `GET /roles?format=simple` como alternativa
4. **Paginación**: Si roles crecen, agregar paginación (no necesario ahora con 3 roles)
5. **i18n**: Soporte multiidioma para nombres de roles
6. **Rate limiting**: Limitar consultas por IP para prevenir abuso

---

### AS-TASK-11: Endpoint PUT /usuarios/:id/rol para cambiar rol de usuario

**Descripción:** Endpoint para actualizar el rol de un usuario existente en el sistema. Este endpoint **reutiliza la implementación creada en AS-TASK-08** para evitar duplicación de código.

**Nota importante:** La implementación fue originalmente desarrollada como parte de AS-TASK-08, pero se reconoce oficialmente como AS-TASK-11 actualizando el taskId en las respuestas y documentación.

**Relación con AS-TASK-08:**
- **AS-TASK-08**: Implementó la funcionalidad completa de actualización de roles
- **AS-TASK-11**: Reconoce y documenta formalmente el mismo endpoint
- **Decisión técnica**: No duplicar código, mantener única implementación

**Archivo:** `auth/src/controllers/auth.controller.js` (método `updateUserRole`)

#### 1. Endpoint PUT /usuarios/:id/rol:

**Request:**
```bash
curl -X PUT http://localhost:3000/api/auth/usuarios/5/rol \
  -H "Content-Type: application/json" \
  -d '{
    "rol": "gestor"
  }'
```

**Request body:**
```json
{
  "rol": "gestor"
}
```

**Response exitoso (200):**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente de \"profesional\" a \"gestor\"",
  "taskId": "AS-TASK-11",
  "data": {
    "id": 5,
    "nombre": "Juan Pérez",
    "email": "juan@innovatech.cl",
    "rolAnterior": "profesional",
    "rolNuevo": "gestor",
    "descripcion": "Gestiona proyectos y recursos del sistema",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

**Response error - Campo faltante (400):**
```json
{
  "success": false,
  "message": "El campo rol es requerido",
  "taskId": "AS-TASK-11",
  "data": null
}
```

**Response error - ID inválido (400):**
```json
{
  "success": false,
  "message": "ID de usuario inválido",
  "taskId": "AS-TASK-11",
  "data": null
}
```

**Response error - Usuario no encontrado (404):**
```json
{
  "success": false,
  "message": "Usuario no encontrado",
  "taskId": "AS-TASK-11",
  "data": null
}
```

**Response error - Rol inválido (500):**
```json
{
  "success": false,
  "message": "Error interno del servidor al actualizar rol",
  "error": "Rol inválido. Valores permitidos: gestor, profesional, directivo",
  "taskId": "AS-TASK-11"
}
```

#### 2. Implementación en controller:

```javascript
/**
 * PUT /usuarios/:id/rol - Actualizar rol de usuario
 * AS-TASK-11: Endpoint para cambiar rol de un usuario
 * Nota: Implementación original creada en AS-TASK-08, reutilizada para AS-TASK-11
 * 
 * Requisitos cumplidos:
 * - Recibe :id en la ruta y rol en el body
 * - Valida que el rol sea uno de: gestor, profesional, directivo
 * - Consulta PostgreSQL para verificar existencia del usuario
 * - Actualiza el rol en la base de datos
 * - Responde con formato JSON estandarizado
 * - Maneja errores con status HTTP apropiados (400, 404, 500)
 * - Registra logs de auditoría (id, rol anterior, rol nuevo, fecha)
 * - Sigue principios SOLID (controller → service → config)
 */
const updateUserRole = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const { rol } = req.body;

    // Log de auditoría: Inicio de solicitud
    console.log(`[AUTH-AUDIT] Solicitud de actualización de rol - UserID: ${id} - Nuevo rol: ${rol || 'N/A'} - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);

    // 1. Validar campo rol
    if (!rol) {
      console.warn(`[AUTH-AUDIT] Actualización fallida - Campo rol faltante - UserID: ${id}`);
      return res.status(400).json({
        success: false,
        message: 'El campo rol es requerido',
        taskId: 'AS-TASK-11',
        data: null
      });
    }

    // 2. Validar que el ID sea un número
    const userId = parseInt(id);
    if (isNaN(userId)) {
      console.warn(`[AUTH-AUDIT] Actualización fallida - ID inválido - ID: ${id}`);
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido',
        taskId: 'AS-TASK-11',
        data: null
      });
    }

    // 3. Obtener usuario actual para logs
    const currentUser = await userService.findById(userId);
    if (!currentUser) {
      console.warn(`[AUTH-AUDIT] Actualización fallida - Usuario no encontrado - UserID: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        taskId: 'AS-TASK-11',
        data: null
      });
    }

    const oldRole = currentUser.rol;

    // 4. Actualizar rol usando UserService (valida rol internamente)
    const updatedUser = await userService.updateUserRole(userId, rol);
    
    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime;

    // Log de auditoría: Actualización exitosa
    console.log(`[AUTH-AUDIT] [OK] Rol actualizado exitosamente - UserID: ${userId} - Email: ${updatedUser.email} - Rol anterior: ${oldRole} - Rol nuevo: ${updatedUser.rol} - Tiempo: ${responseTime}ms - Timestamp: ${new Date().toISOString()}`);

    // 5. Responder con éxito
    res.status(200).json({
      success: true,
      message: `Rol actualizado exitosamente de "${oldRole}" a "${rol}"`,
      taskId: 'AS-TASK-11',
      data: {
        id: updatedUser.id,
        nombre: updatedUser.nombre,
        email: updatedUser.email,
        rolAnterior: oldRole,
        rolNuevo: updatedUser.rol,
        descripcion: getRoleDescription(updatedUser.rol),
        updatedAt: updatedUser.updated_at
      }
    });
  } catch (error) {
    // Log de auditoría: Error del servidor
    console.error(`[AUTH-AUDIT] [ERROR] Error al actualizar rol - UserID: ${req.params.id} - Error: ${error.message} - Timestamp: ${new Date().toISOString()}`);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar rol',
      error: error.message,
      taskId: 'AS-TASK-11'
    });
  }
};
```

#### 3. Implementación en service:

**Archivo:** `auth/src/services/user.service.js`

```javascript
/**
 * Actualizar rol de usuario
 * @param {number} userId - ID del usuario
 * @param {string} newRole - Nuevo rol a asignar
 * @returns {Promise<Object>} - Usuario actualizado
 */
async updateUserRole(userId, newRole) {
  try {
    // 1. Validar que el rol sea válido
    if (!isValidRole(newRole)) {
      throw new Error(`Rol inválido. Valores permitidos: ${VALID_ROLES.join(', ')}`);
    }

    // 2. Verificar que el usuario existe
    const userExists = await this.findById(userId);
    if (!userExists) {
      throw new Error('Usuario no encontrado');
    }

    // 3. Actualizar rol en BD
    const result = await query(
      `UPDATE usuarios 
       SET rol = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, nombre, email, rol, updated_at`,
      [newRole, userId]
    );

    const updatedUser = result.rows[0];
    
    console.log(`[UserService] Rol actualizado - UserID: ${updatedUser.id} - Nuevo rol: ${updatedUser.rol}`);
    
    return updatedUser;
  } catch (error) {
    console.error('[UserService] Error al actualizar rol:', error);
    throw error;
  }
}
```

#### 4. Configuración de ruta:

**Archivo:** `auth/src/routes/auth.routes.js`

```javascript
// Endpoints de roles
router.get('/roles', authController.getRoles); // AS-TASK-08: Info detallada
router.get('/roles/simple', authController.getRolesSimple); // AS-TASK-10: Solo nombres
router.put('/usuarios/:id/rol', authController.updateUserRole); // AS-TASK-11: Cambiar rol
```

#### 5. Logs de auditoría:

**Solicitud de actualización:**
```
[AUTH-AUDIT] Solicitud de actualización de rol - UserID: 5 - Nuevo rol: gestor - IP: ::1 - Timestamp: 2024-01-15T14:30:00.000Z
```

**Actualización exitosa:**
```
[UserService] Rol actualizado - UserID: 5 - Nuevo rol: gestor
[AUTH-AUDIT] [OK] Rol actualizado exitosamente - UserID: 5 - Email: juan@innovatech.cl - Rol anterior: profesional - Rol nuevo: gestor - Tiempo: 45ms - Timestamp: 2024-01-15T14:30:00.045Z
```

**Error - Usuario no encontrado:**
```
[AUTH-AUDIT] Solicitud de actualización de rol - UserID: 999 - Nuevo rol: gestor - IP: ::1 - Timestamp: 2024-01-15T14:31:00.000Z
[AUTH-AUDIT] Actualización fallida - Usuario no encontrado - UserID: 999
```

**Error - Rol inválido:**
```
[AUTH-AUDIT] Solicitud de actualización de rol - UserID: 5 - Nuevo rol: admin - IP: ::1 - Timestamp: 2024-01-15T14:32:00.000Z
[UserService] Error al actualizar rol: Error: Rol inválido. Valores permitidos: gestor, profesional, directivo
[AUTH-AUDIT] [ERROR] Error al actualizar rol - UserID: 5 - Error: Rol inválido. Valores permitidos: gestor, profesional, directivo - Timestamp: 2024-01-15T14:32:00.005Z
```

**Error - Campo faltante:**
```
[AUTH-AUDIT] Solicitud de actualización de rol - UserID: 5 - Nuevo rol: N/A - IP: ::1 - Timestamp: 2024-01-15T14:33:00.000Z
[AUTH-AUDIT] Actualización fallida - Campo rol faltante - UserID: 5
```

#### 6. Testing:

**Test 1: Actualización exitosa de profesional a gestor**
```bash
curl -X PUT http://localhost:3000/api/auth/usuarios/5/rol \
  -H "Content-Type: application/json" \
  -d '{"rol": "gestor"}'

# Response esperado:
{
  "success": true,
  "message": "Rol actualizado exitosamente de \"profesional\" a \"gestor\"",
  "taskId": "AS-TASK-11",
  "data": {
    "id": 5,
    "nombre": "Juan Pérez",
    "email": "juan@innovatech.cl",
    "rolAnterior": "profesional",
    "rolNuevo": "gestor",
    "descripcion": "Gestiona proyectos y recursos del sistema",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

**Test 2: Actualización de gestor a directivo**
```bash
curl -X PUT http://localhost:3000/api/auth/usuarios/3/rol \
  -H "Content-Type: application/json" \
  -d '{"rol": "directivo"}'

# Response esperado:
{
  "success": true,
  "message": "Rol actualizado exitosamente de \"gestor\" a \"directivo\"",
  "taskId": "AS-TASK-11",
  "data": {
    "id": 3,
    "nombre": "María López",
    "email": "maria@innovatech.cl",
    "rolAnterior": "gestor",
    "rolNuevo": "directivo",
    "descripcion": "Directivo con acceso a reportes y KPIs",
    "updatedAt": "2024-01-15T14:35:00.000Z"
  }
}
```

**Test 3: Error - Campo rol faltante**
```bash
curl -X PUT http://localhost:3000/api/auth/usuarios/5/rol \
  -H "Content-Type: application/json" \
  -d '{}'

# Response esperado (400):
{
  "success": false,
  "message": "El campo rol es requerido",
  "taskId": "AS-TASK-11",
  "data": null
}
```

**Test 4: Error - ID inválido**
```bash
curl -X PUT http://localhost:3000/api/auth/usuarios/abc/rol \
  -H "Content-Type: application/json" \
  -d '{"rol": "gestor"}'

# Response esperado (400):
{
  "success": false,
  "message": "ID de usuario inválido",
  "taskId": "AS-TASK-11",
  "data": null
}
```

**Test 5: Error - Usuario no encontrado**
```bash
curl -X PUT http://localhost:3000/api/auth/usuarios/999/rol \
  -H "Content-Type: application/json" \
  -d '{"rol": "gestor"}'

# Response esperado (404):
{
  "success": false,
  "message": "Usuario no encontrado",
  "taskId": "AS-TASK-11",
  "data": null
}
```

**Test 6: Error - Rol inválido**
```bash
curl -X PUT http://localhost:3000/api/auth/usuarios/5/rol \
  -H "Content-Type: application/json" \
  -d '{"rol": "admin"}'

# Response esperado (500):
{
  "success": false,
  "message": "Error interno del servidor al actualizar rol",
  "error": "Rol inválido. Valores permitidos: gestor, profesional, directivo",
  "taskId": "AS-TASK-11"
}
```

#### 7. Validaciones implementadas:

| Validación | Implementada por | Error |
|------------|------------------|-------|
| Campo `rol` requerido | Controller | 400 - "El campo rol es requerido" |
| ID debe ser número | Controller | 400 - "ID de usuario inválido" |
| Usuario debe existir | Service (findById) | 404 - "Usuario no encontrado" |
| Rol debe ser válido | Service (isValidRole) | 500 - "Rol inválido. Valores permitidos: ..." |

#### 8. Flujo de datos:

```
Cliente → Controller → Service → Config → PostgreSQL
         ↓           ↓          ↓
      Validación   Lógica   Validación
      HTTP         Negocio   Roles
```

**Flujo detallado:**

1. **Controller** (`auth.controller.js`):
   - Recibe request con `:id` y `{rol}`
   - Valida campo `rol` presente
   - Valida `id` es número
   - Log auditoría inicio

2. **Service** (`user.service.js`):
   - Recibe `userId` y `newRole`
   - Valida usuario existe con `findById()`
   - Valida rol con `isValidRole()` de config
   - Ejecuta UPDATE en PostgreSQL
   - Retorna usuario actualizado

3. **Config** (`roles.js`):
   - Función `isValidRole(rol)` verifica rol válido
   - Retorna `true/false`

4. **Controller** (continuación):
   - Recibe usuario actualizado
   - Log auditoría éxito con rol anterior y nuevo
   - Responde HTTP 200 con data completa

#### 9. Principios SOLID aplicados:

**Single Responsibility:**
- **Controller**: Maneja HTTP request/response y validaciones de entrada
- **Service**: Lógica de negocio y actualización en BD
- **Config**: Definición y validación de roles
- Cada capa tiene una única responsabilidad

**Open/Closed:**
- Agregar nuevos roles solo requiere modificar `config/roles.js`
- No necesita cambios en controller o service
- Extensible sin modificar código existente

**Liskov Substitution:**
- Service podría ser reemplazado por otra implementación
- Interface consistente: `updateUserRole(userId, newRole)`

**Interface Segregation:**
- Controller solo usa métodos necesarios: `findById()`, `updateUserRole()`
- No depende de métodos innecesarios del service

**Dependency Inversion:**
- Controller depende de abstracción (userService)
- Service depende de abstracción (config/roles)
- No hay dependencias directas a implementaciones concretas

#### 10. Integración con frontend:

**React example:**
```javascript
// Actualizar rol de usuario
const updateUserRole = async (userId, newRole) => {
  try {
    const response = await fetch(`/api/auth/usuarios/${userId}/rol`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol: newRole })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`Rol actualizado: ${data.data.rolAnterior} → ${data.data.rolNuevo}`);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    throw error;
  }
};

// Uso en componente
const handleRoleChange = async (userId, newRole) => {
  try {
    const result = await updateUserRole(userId, newRole);
    setUsers(users.map(user => 
      user.id === userId ? { ...user, rol: result.rolNuevo } : user
    ));
    toast.success(`Rol actualizado a ${result.rolNuevo}`);
  } catch (error) {
    toast.error(error.message);
  }
};
```

**Angular example:**
```typescript
// Service
updateUserRole(userId: number, newRole: string): Observable<any> {
  return this.http.put(`/api/auth/usuarios/${userId}/rol`, { rol: newRole })
    .pipe(
      tap(response => {
        if (response.success) {
          console.log(`Rol actualizado: ${response.data.rolAnterior} → ${response.data.rolNuevo}`);
        }
      }),
      catchError(error => {
        console.error('Error al actualizar rol:', error);
        return throwError(() => error);
      })
    );
}

// Component
updateRole(userId: number, newRole: string) {
  this.userService.updateUserRole(userId, newRole).subscribe({
    next: (response) => {
      this.snackBar.open(`Rol actualizado a ${response.data.rolNuevo}`, 'OK');
      this.loadUsers(); // Recargar lista
    },
    error: (error) => {
      this.snackBar.open(error.error.message, 'Error');
    }
  });
}
```

#### 11. Casos de uso:

**Caso 1: Promoción de profesional a gestor**
- Un profesional ha demostrado capacidad de gestión
- Admin actualiza su rol de "profesional" a "gestor"
- Usuario obtiene permisos adicionales (crear proyectos, asignar tareas)

**Caso 2: Cambio de gestor a directivo**
- Un gestor es promovido a posición directiva
- Admin actualiza su rol de "gestor" a "directivo"
- Usuario obtiene acceso a reportes, KPIs y analytics

**Caso 3: Degradación temporal de rol**
- Usuario con comportamiento sospechoso
- Admin degrada temporalmente de "gestor" a "profesional"
- Se restringe acceso a funcionalidades críticas

**Caso 4: Corrección de rol asignado incorrectamente**
- Usuario fue registrado con rol incorrecto
- Admin corrige el rol inmediatamente
- Usuario obtiene permisos correctos desde el inicio

#### 12. Diferencias con AS-TASK-08:

| Aspecto | AS-TASK-08 | AS-TASK-11 |
|---------|------------|------------|
| **Propósito** | Implementación original | Reconocimiento formal |
| **Código** | Creó la funcionalidad | Reutiliza la misma |
| **taskId en responses** | "AS-TASK-08" | "AS-TASK-11" |
| **Comentarios en código** | Menciona AS-TASK-08 | Menciona AS-TASK-11 y origen |
| **Documentación** | Parte de sistema de roles | Documentación específica del endpoint |
| **Funcionalidad** | Idéntica | Idéntica |

**Decisión de diseño:** En lugar de duplicar código, se actualizó el `taskId` y comentarios para reconocer formalmente el endpoint como AS-TASK-11, manteniendo la única implementación creada en AS-TASK-08.

#### 13. Endpoints de gestión de usuarios/roles:

| Endpoint | Método | Descripción | AS-TASK | Autenticación |
|----------|--------|-------------|---------|---------------|
| `/api/auth/register` | POST | Registrar nuevo usuario | AS-TASK-04 | No |
| `/api/auth/login` | POST | Iniciar sesión | AS-TASK-05 | No |
| `/api/auth/logout` | POST | Cerrar sesión | AS-TASK-07 | Sí (JWT) |
| `/api/auth/roles` | GET | Info detallada de roles | AS-TASK-08 | No |
| `/api/auth/roles/simple` | GET | Solo nombres de roles | AS-TASK-10 | No |
| `/api/auth/usuarios/:id/rol` | PUT | Cambiar rol de usuario | AS-TASK-11 | No* |

*Nota: Actualmente sin autenticación, pero en producción debería requerir JWT con rol admin/gestor.

#### 14. Seguridad y mejoras futuras:

**Mejoras de seguridad sugeridas:**

1. **Autenticación obligatoria:**
```javascript
router.put('/usuarios/:id/rol', verifyToken, authController.updateUserRole);
```

2. **Autorización por rol:**
```javascript
router.put('/usuarios/:id/rol', 
  verifyToken, 
  checkRole('usuarios', 'actualizar'), // Solo gestor puede cambiar roles
  authController.updateUserRole
);
```

3. **Prevenir auto-modificación:**
```javascript
// En controller
const tokenUserId = req.user.id; // Extraído del JWT
if (userId === tokenUserId) {
  return res.status(403).json({
    success: false,
    message: 'No puedes cambiar tu propio rol',
    taskId: 'AS-TASK-11'
  });
}
```

4. **Historial de cambios de rol:**
```sql
CREATE TABLE rol_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES usuarios(id),
  rol_anterior VARCHAR(50),
  rol_nuevo VARCHAR(50),
  changed_by INTEGER REFERENCES usuarios(id),
  changed_at TIMESTAMP DEFAULT NOW()
);
```

5. **Notificaciones al usuario:**
- Email cuando su rol es modificado
- Notificación en app sobre cambio de permisos

6. **Rate limiting:**
- Limitar cambios de rol a N por minuto
- Prevenir ataques de fuerza bruta

7. **Validación adicional:**
- Solo ciertos roles pueden promover a otros
- Gestor puede cambiar profesional ↔ gestor
- Solo admin puede crear directivos

#### 15. Métricas y monitoreo:

**Logs a monitorear:**
```
[AUTH-AUDIT] Solicitud de actualización de rol - UserID: X - Nuevo rol: Y
[AUTH-AUDIT] [OK] Rol actualizado exitosamente - UserID: X - Rol anterior: A - Rol nuevo: B
[AUTH-AUDIT] [ERROR] Error al actualizar rol - UserID: X - Error: Mensaje
```

**KPIs sugeridos:**
- Cantidad de cambios de rol por día/semana/mes
- Tiempo promedio de actualización (debe ser < 100ms)
- Tasa de errores (400/404/500)
- Distribución de roles en el sistema
- Usuarios más cambiados de rol (posible sospecha)

**Dashboard de auditoría:**
- Gráfico de cambios de rol en el tiempo
- Tabla de últimos cambios con: usuario, rol anterior, rol nuevo, fecha, quien lo cambió
- Alertas ante patrones sospechosos (muchos cambios en poco tiempo)

#### 16. Estructura de archivos final:

```
auth/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js      (updateUserRole con taskId: AS-TASK-11)
│   ├── services/
│   │   └── user.service.js         (updateUserRole con validaciones)
│   ├── routes/
│   │   └── auth.routes.js          (PUT /usuarios/:id/rol)
│   ├── config/
│   │   └── roles.js                (isValidRole, getAllRoles)
│   └── middleware/
│       └── auth.middleware.js      (verifyToken - para uso futuro)
└── README.md                        (Documentación AS-TASK-11)
```

---

### AS-TASK-12: Configurar auditoría de accesos y operaciones críticas

**Objetivo:** Implementar sistema completo de auditoría para registrar automáticamente todos los accesos a endpoints protegidos y operaciones críticas (registro, login, logout, cambio de rol) en archivos de log locales con formato estandarizado.

#### 1. Componentes implementados:

**Logger centralizado (`logger.js`):**
- Formato estandarizado: `[OK]/[ERROR] - Timestamp - UserID - Operación - Email - IP - Detalle - taskId`
- Escritura en archivos: `logs/audit.log` (auditoría general) y `logs/error.log` (solo errores)
- Rotación automática de archivos cuando superan 10MB
- No registra contraseñas ni tokens completos (solo primeros y últimos 8 caracteres)
- Métodos: `auditSuccess()`, `auditError()`, `auditWarning()`, `logCriticalOperation()`, `logEndpointAccess()`
- Singleton pattern para instancia única

**Middleware de auditoría (`auditMiddleware.js`):**
- `auditMiddleware`: Intercepta todas las requests y registra accesos automáticamente
- `auditCriticalOperation`: Middleware específico para operaciones críticas (REGISTER, LOGIN, LOGOUT, ROLE_CHANGE)
- `auditUnauthorizedAccess`: Registra intentos de acceso no autorizados (401/403)
- Mide tiempo de respuesta en milisegundos
- No bloquea flujo de la aplicación

#### 2. Formato de logs:

**Log exitoso:**
```
[OK] - 2024-01-15T10:30:45.123Z - UserID:5 - Operación:LOGIN - Email:juan@innovatech.cl - IP:192.168.1.1 - Login exitoso - Rol: gestor - Expira: 1h - Tiempo:45ms - taskId:AS-TASK-12
```

**Log de error:**
```
[ERROR] - 2024-01-15T10:31:10.456Z - UserID:N/A - Operación:LOGIN - Email:maria@innovatech.cl - IP:192.168.1.2 - Error en login - Error: Credenciales inválidas - Tiempo:23ms - taskId:AS-TASK-12
```

**Log de advertencia (acceso denegado):**
```
[WARNING] - 2024-01-15T10:32:00.789Z - UserID:3 - Operación:PUT /usuarios/5/rol - Email:pedro@innovatech.cl - IP:192.168.1.3 - Acceso denegado - Status:403 - Tiempo:12ms - taskId:AS-TASK-12
```

#### 3. Operaciones críticas auditadas:

| Operación | Middleware | Archivo Controller | Detalles Registrados |
|-----------|------------|-------------------|----------------------|
| REGISTER | auditCriticalOperation('REGISTER') | auth.controller.js | UserID, Email, Rol, IP, responseTime |
| LOGIN | auditCriticalOperation('LOGIN') | auth.controller.js | UserID, Email, Rol, IP, Expira, responseTime |
| LOGOUT | auditCriticalOperation('LOGOUT') | auth.controller.js | UserID, Email, IP, Token invalidado, responseTime |
| ROLE_CHANGE | auditCriticalOperation('ROLE_CHANGE') | auth.controller.js | UserID, Email, Rol anterior, Rol nuevo, IP, responseTime |

#### 4. Archivos de log:

**Ubicación:** `auth/logs/`

**Archivos generados:**
- `audit.log` - Todos los accesos y operaciones (exitosas y fallidas)
- `error.log` - Solo operaciones fallidas y errores del servidor

**Rotación automática:**
- Se activa cuando un archivo supera 10MB
- Archivo rotado se renombra a: `audit-2024-01-15T10-30-45.log`
- Nuevo archivo vacío se crea automáticamente

**Configuración en .gitignore:**
```gitignore
# Logs
*.log
npm-debug.log*
logs/*.log
logs/*.log.*
!logs/.gitkeep
```

#### 5. Implementación en routes:

**Archivo:** `auth/src/routes/auth.routes.js`

```javascript
// AS-TASK-12: Importar middleware de auditoría
const { auditMiddleware, auditCriticalOperation } = require('../middleware/auditMiddleware');

// AS-TASK-12: Aplicar auditoría a todas las rutas (excepto health check)
router.use((req, res, next) => {
  if (req.path !== '/health') {
    return auditMiddleware(req, res, next);
  }
  next();
});

// Endpoints de autenticación con auditoría de operaciones críticas
router.post('/register', auditCriticalOperation('REGISTER'), authController.register);
router.post('/login', auditCriticalOperation('LOGIN'), authController.login);
router.post('/logout', verifyToken, auditCriticalOperation('LOGOUT'), authController.logout);
router.put('/usuarios/:id/rol', auditCriticalOperation('ROLE_CHANGE'), authController.updateUserRole);
```

#### 6. Implementación en controller:

**Migración de logs a logger centralizado:**

**Antes (console.log):**
```javascript
console.log(`[AUTH-AUDIT] [OK] Login exitoso - UserID: ${user.id} - Email: ${user.email} - Rol: ${user.rol} - Tiempo: ${responseTime}ms - Timestamp: ${new Date().toISOString()}`);
```

**Después (logger centralizado):**
```javascript
// AS-TASK-12: Importar logger
const logger = require('../utils/logger');

// AS-TASK-12: Log de auditoría con logger
logger.logCriticalOperation('LOGIN', {
  success: true,
  userId: user.id,
  email: user.email,
  ip: req.ip,
  detail: `Login exitoso - Rol: ${user.rol} - Expira: ${jwtConfig.expiresIn}`,
  responseTime,
  taskId: 'AS-TASK-12'
});
```

#### 7. Ejemplo de salida en archivo audit.log:

```
[OK] - 2024-01-15T10:00:00.123Z - UserID:1 - Operación:REGISTER - Email:juan@innovatech.cl - IP:192.168.1.10 - Usuario registrado - Rol: gestor - Tiempo:156ms - taskId:AS-TASK-12
[OK] - 2024-01-15T10:05:30.456Z - UserID:1 - Operación:LOGIN - Email:juan@innovatech.cl - IP:192.168.1.10 - Login exitoso - Rol: gestor - Expira: 1h - Tiempo:45ms - taskId:AS-TASK-12
[OK] - 2024-01-15T10:10:15.789Z - UserID:1 - Operación:GET /roles - Email:juan@innovatech.cl - IP:192.168.1.10 - Status:200 - Tiempo:12ms - taskId:AS-TASK-12
[OK] - 2024-01-15T10:15:45.012Z - UserID:1 - Operación:ROLE_CHANGE - Email:juan@innovatech.cl - IP:192.168.1.10 - Rol actualizado - Anterior: gestor - Nuevo: directivo - Tiempo:78ms - taskId:AS-TASK-12
[ERROR] - 2024-01-15T10:20:00.345Z - UserID:N/A - Operación:LOGIN - Email:hacker@evil.com - IP:192.168.1.99 - Error en login - Error: Credenciales inválidas - Tiempo:23ms - taskId:AS-TASK-12
[WARNING] - 2024-01-15T10:25:30.678Z - UserID:2 - Operación:PUT /usuarios/1/rol - Email:pedro@innovatech.cl - IP:192.168.1.11 - Acceso denegado - Status:403 - Tiempo:8ms - taskId:AS-TASK-12
[OK] - 2024-01-15T10:30:00.901Z - UserID:1 - Operación:LOGOUT - Email:juan@innovatech.cl - IP:192.168.1.10 - Logout exitoso - Token invalidado - Tiempo:34ms - taskId:AS-TASK-12
```

#### 8. Seguridad y privacidad:

**Datos que NO se registran:**
- Contraseñas (ni plain text ni hash completo)
- Tokens JWT completos (solo primeros y últimos 8 caracteres)
- Información sensible de payloads (números de tarjeta, datos personales)

**Ejemplo de sanitización de token:**
```javascript
// Token original: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqdWFuQGlubm...
// Token sanitizado: eyJhbGci...ubm92YXRlY2g=
```

#### 9. Principios SOLID aplicados:

**Single Responsibility:**
- `logger.js`: Solo maneja logging y persistencia en archivos
- `auditMiddleware.js`: Solo intercepta requests y registra accesos
- `auth.controller.js`: Solo maneja lógica de negocio (delega logging a logger)

**Open/Closed:**
- Sistema extensible: agregar nuevo tipo de log solo requiere nuevo método en logger
- No modificar código existente para agregar nueva funcionalidad

**Dependency Inversion:**
- Controllers dependen de abstracción (logger) no de implementación concreta (fs)
- Fácil cambiar backend de logs (archivo → BD → servicio externo) sin tocar controllers

#### 10. Comandos útiles:

**Ver logs en tiempo real:**
```bash
# Linux/Mac
tail -f auth/logs/audit.log

# Windows PowerShell
Get-Content auth/logs/audit.log -Wait -Tail 50
```

**Buscar logs de un usuario específico:**
```bash
# Linux/Mac
grep "UserID:5" auth/logs/audit.log

# Windows PowerShell
Select-String -Path auth/logs/audit.log -Pattern "UserID:5"
```

**Contar operaciones por tipo:**
```bash
# Linux/Mac
grep -c "Operación:LOGIN" auth/logs/audit.log

# Windows PowerShell
(Select-String -Path auth/logs/audit.log -Pattern "Operación:LOGIN").Count
```

**Ver solo errores:**
```bash
cat auth/logs/error.log
```

#### 11. Estructura de archivos final:

```
auth/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js      (usa logger para operaciones críticas)
│   ├── middleware/
│   │   └── auditMiddleware.js      (AS-TASK-12: auditoría automática)
│   ├── utils/
│   │   ├── jwt.helper.js
│   │   └── logger.js               (AS-TASK-12: logger centralizado)
│   └── routes/
│       └── auth.routes.js          (aplica auditMiddleware a rutas)
├── logs/
│   ├── .gitkeep                    (mantiene directorio en Git)
│   ├── audit.log                   (excluido de Git)
│   └── error.log                   (excluido de Git)
└── .gitignore                       (actualizado para logs)
```

#### 12. Mejoras futuras sugeridas:

1. **Persistencia en base de datos:**
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id INTEGER REFERENCES usuarios(id),
  operation VARCHAR(50),
  email VARCHAR(255),
  ip VARCHAR(45),
  status VARCHAR(20),
  detail TEXT,
  response_time INTEGER,
  task_id VARCHAR(20)
);
```

2. **Integración con servicios externos:**
- Envío a Elasticsearch/Logstash/Kibana (ELK Stack)
- Integración con Datadog, New Relic, o Splunk
- Alertas automáticas en Slack/Discord para errores críticos

3. **Dashboard de auditoría:**
- Panel web para visualizar logs en tiempo real
- Gráficos de operaciones por hora/día/mes
- Alertas ante patrones sospechosos (muchos fallos de login)

4. **Análisis de seguridad:**
- Detección de IPs sospechosas (muchos intentos fallidos)
- Alertas ante escalación de privilegios no autorizada
- Reportes de auditoría periódicos (diarios/semanales)

5. **Compresión de logs antiguos:**
```bash
# Comprimir logs de hace más de 30 días
find logs/ -name "*.log" -mtime +30 -exec gzip {} \;
```

6. **Retención de logs:**
- Mantener logs de últimos 90 días en archivo
- Archivar logs antiguos en S3/Azure Blob Storage
- Política de eliminación después de 1 año

#### 13. Testing:

**Test 1: Verificar que se crea el archivo de log**
```bash
# Hacer una operación (ej: login)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "juan@innovatech.cl", "password": "password123"}'

# Verificar que existe el archivo
ls -la auth/logs/audit.log

# Leer contenido
cat auth/logs/audit.log | grep "LOGIN"
```

**Test 2: Verificar rotación de archivos**
```bash
# Simular archivo grande (solo para pruebas)
dd if=/dev/zero of=auth/logs/audit.log bs=1M count=11

# Hacer una operación
curl -X GET http://localhost:3000/api/auth/roles

# Verificar que se creó archivo rotado
ls -la auth/logs/audit-*.log
```

**Test 3: Verificar que no se registran contraseñas**
```bash
# Hacer registro con contraseña
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test", "email": "test@test.cl", "password": "SuperSecretPassword123"}'

# Verificar que NO aparece la contraseña en logs
grep -i "SuperSecretPassword123" auth/logs/audit.log
# Debe retornar: (no matches)
```

---

### AS-TASK-13: Configurar sistema de logs centralizados con Winston

**Objetivo:** Migrar sistema de logs de implementación custom (AS-TASK-12) a Winston, una librería profesional de logging para Node.js, mejorando escalabilidad, mantenibilidad y preparación para integración con servicios externos (ELK Stack, CloudWatch, Datadog).

#### 1. Motivación de la migración:

**AS-TASK-12 (Sistema custom con fs):**
- ✅ Funcional y cumple requisitos básicos
- ❌ Rotación manual por tamaño (10MB)
- ❌ Solo 2 niveles: [OK] y [ERROR]
- ❌ Difícil integración con servicios externos
- ❌ Sin soporte para múltiples formatos
- ❌ Requiere mantenimiento custom

**AS-TASK-13 (Winston profesional):**
- ✅ Librería probada en producción (4M descargas/semana)
- ✅ Rotación automática por fecha + tamaño
- ✅ 5 niveles: error, warn, info, http, debug
- ✅ Integración nativa con ELK, CloudWatch, Datadog
- ✅ Múltiples formatos: JSON, colorized, custom
- ✅ Mantenimiento delegado a comunidad Open Source

#### 2. Paquetes instalados:

```bash
npm install winston winston-daily-rotate-file
```

**Dependencias agregadas a package.json:**
```json
{
  "dependencies": {
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1"
  }
}
```

#### 3. Configuración de Winston:

**Archivo:** `auth/src/utils/logger.js`

**Transportes configurados:**

| Transporte | Tipo | Nivel | Archivo | Rotación | Retención |
|-----------|------|-------|---------|----------|-----------|
| Console | winston.transports.Console | info (dev) / error (prod) | N/A | N/A | N/A |
| Audit | DailyRotateFile | info | audit-%DATE%.log | Diaria + 20MB | 14 días |
| Error | DailyRotateFile | error | error-%DATE%.log | Diaria + 20MB | 30 días |

**Variables de entorno:**
```bash
LOG_LEVEL=info        # Nivel mínimo de log (debug, info, warn, error)
NODE_ENV=production   # Producción: solo errors en consola
```

#### 4. Formato de logs (mantiene compatibilidad con AS-TASK-12):

**Log exitoso (nivel info):**
```
[OK] - 2024-01-15T10:30:45.123Z - UserID:5 - Operación:LOGIN - Email:juan@innovatech.cl - IP:192.168.1.1 - Login exitoso - Rol: gestor - Expira: 1h - Tiempo:45ms - taskId:AS-TASK-13
```

**Log de error (nivel error):**
```
[ERROR] - 2024-01-15T10:31:10.456Z - UserID:N/A - Operación:LOGIN - Email:maria@innovatech.cl - IP:192.168.1.2 - Error en login - Error: Credenciales inválidas - Tiempo:23ms - taskId:AS-TASK-13
```

**Log de advertencia (nivel warn):**
```
[WARNING] - 2024-01-15T10:32:00.789Z - UserID:3 - Operación:PUT /usuarios/5/rol - Email:pedro@innovatech.cl - IP:192.168.1.3 - Acceso denegado - Status:403 - Tiempo:12ms - taskId:AS-TASK-13
```

#### 5. API pública (sin cambios para compatibilidad):

**Métodos principales (idénticos a AS-TASK-12):**
```javascript
const logger = require('./utils/logger');

// Log de éxito
logger.auditSuccess({
  userId: 5,
  email: 'juan@innovatech.cl',
  operation: 'LOGIN',
  detail: 'Login exitoso',
  ip: '192.168.1.1',
  responseTime: 45,
  taskId: 'AS-TASK-13'
});

// Log de error
logger.auditError({
  userId: null,
  email: 'maria@innovatech.cl',
  operation: 'LOGIN',
  detail: 'Error en login',
  ip: '192.168.1.2',
  responseTime: 23,
  taskId: 'AS-TASK-13'
});

// Log de advertencia
logger.auditWarning({
  userId: 3,
  email: 'pedro@innovatech.cl',
  operation: 'PUT /usuarios/5/rol',
  detail: 'Acceso denegado - Status:403',
  ip: '192.168.1.3',
  responseTime: 12,
  taskId: 'AS-TASK-13'
});

// Log de operación crítica (REGISTER, LOGIN, LOGOUT, ROLE_CHANGE)
logger.logCriticalOperation('LOGIN', {
  success: true,
  userId: 5,
  email: 'juan@innovatech.cl',
  ip: '192.168.1.1',
  detail: 'Login exitoso - Rol: gestor',
  responseTime: 45,
  taskId: 'AS-TASK-13'
});

// Log de acceso a endpoint
logger.logEndpointAccess(req, 45, 200);
```

**Métodos adicionales de Winston:**
```javascript
// Log de debug (desarrollo)
logger.debug('Variable x tiene valor 123');

// Log HTTP (requests)
logger.http('GET /api/auth/roles - 200 OK - 12ms');
```

#### 6. Arquitectura de Winston Logger:

```
┌─────────────────────────────────────────────────────────┐
│                    Winston Logger                       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Formato Personalizado                   │  │
│  │  [OK]/[ERROR] - Timestamp - UserID - Operación  │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
│         ┌────────────────┼────────────────┐            │
│         │                │                │            │
│         ▼                ▼                ▼            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐        │
│  │ Console  │    │  Audit   │    │  Error   │        │
│  │Transport │    │RotateFile│    │RotateFile│        │
│  │          │    │          │    │          │        │
│  │ Colorized│    │ audit-   │    │ error-   │        │
│  │ Dev Mode │    │ %DATE%   │    │ %DATE%   │        │
│  └──────────┘    │.log      │    │.log      │        │
│                  │          │    │          │        │
│                  │ 14 días  │    │ 30 días  │        │
│                  │ 20MB max │    │ 20MB max │        │
│                  └──────────┘    └──────────┘        │
└─────────────────────────────────────────────────────────┘
```

#### 7. Rotación automática de archivos:

**Patrón de nombres:**
```
logs/
├── audit-2024-01-15.log    ← Hoy
├── audit-2024-01-14.log    ← Ayer
├── audit-2024-01-13.log
├── ...
├── audit-2024-01-01.log    ← Se elimina automáticamente después de 14 días
├── error-2024-01-15.log
├── error-2024-01-14.log
└── ...
```

**Configuración de rotación:**
```javascript
new DailyRotateFile({
  filename: 'logs/audit-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',      // Rota cuando alcanza 20MB
  maxFiles: '14d',     // Mantiene solo últimos 14 días
  level: 'info'
})
```

**Ventajas:**
- No requiere scripts externos de rotación
- Limpieza automática de logs antiguos
- Nombres predecibles para búsqueda
- Un archivo por día (fácil auditoría)

#### 8. Niveles de log de Winston:

| Nivel | Valor | Uso | Ejemplo |
|-------|-------|-----|---------|
| error | 0 | Errores críticos del servidor | Error de conexión a BD |
| warn | 1 | Advertencias, accesos denegados | 403 Forbidden |
| info | 2 | Operaciones normales exitosas | Login exitoso |
| http | 3 | Requests HTTP | GET /api/auth/roles |
| debug | 4 | Debugging en desarrollo | Variable x = 123 |

**Ejemplo de uso por nivel:**
```javascript
logger.winstonLogger.error('Error crítico: BD desconectada');
logger.winstonLogger.warn('Acceso denegado: rol insuficiente');
logger.winstonLogger.info('Usuario 5 creó proyecto 123');
logger.winstonLogger.http('GET /api/auth/roles - 200 OK - 12ms');
logger.winstonLogger.debug('Token JWT generado: eyJhbGci...');
```

#### 9. Integración con servicios externos:

**ELK Stack (Elasticsearch + Logstash + Kibana):**
```bash
npm install winston-elasticsearch
```

```javascript
const { ElasticsearchTransport } = require('winston-elasticsearch');

this.winstonLogger.add(new ElasticsearchTransport({
  level: 'info',
  clientOpts: {
    node: 'http://localhost:9200'
  },
  index: 'innovatech-auth-logs'
}));
```

**AWS CloudWatch:**
```bash
npm install winston-cloudwatch
```

```javascript
const WinstonCloudWatch = require('winston-cloudwatch');

this.winstonLogger.add(new WinstonCloudWatch({
  logGroupName: 'innovatech-auth',
  logStreamName: 'production',
  awsRegion: 'us-east-1'
}));
```

**Datadog:**
```bash
npm install @datadog/winston-datadog
```

```javascript
const DatadogWinston = require('@datadog/winston-datadog');

this.winstonLogger.add(new DatadogWinston({
  apiKey: process.env.DATADOG_API_KEY,
  hostname: 'auth-service',
  service: 'innovatech-auth'
}));
```

#### 10. Migración de AS-TASK-12 a AS-TASK-13:

**Cambios en logger.js:**

| Aspecto | AS-TASK-12 (custom) | AS-TASK-13 (Winston) |
|---------|---------------------|----------------------|
| Import | `const fs = require('fs')` | `const winston = require('winston')` |
| Instancia | `new Logger()` | `winston.createLogger()` |
| Escritura | `fs.appendFileSync()` | `this.winstonLogger.info()` |
| Rotación | Manual (10MB) | Automática (diaria + 20MB) |
| Formato | Custom string | winston.format.printf() |
| Niveles | [OK]/[ERROR] | error/warn/info/http/debug |
| Consola | `console.log()` | winston.transports.Console |
| Métodos públicos | ✅ Mantenidos sin cambios | ✅ Mantenidos sin cambios |

**Cambios en controllers:**
- taskId: 'AS-TASK-12' → taskId: 'AS-TASK-13'
- Comentarios: "AS-TASK-12: Log" → "AS-TASK-13: Log con Winston"

**Sin cambios:**
- auditMiddleware.js (usa abstracción de logger)
- auth.routes.js (usa abstracción de logger)
- Formato de logs (mantiene compatibilidad)
- API pública de logger (mantiene compatibilidad)

#### 11. Comandos útiles:

**Ver logs de hoy:**
```bash
# Linux/Mac
tail -f logs/audit-$(date +%Y-%m-%d).log

# Windows PowerShell
$today = Get-Date -Format "yyyy-MM-dd"
Get-Content "logs\audit-$today.log" -Wait -Tail 50
```

**Ver logs de una fecha específica:**
```bash
cat logs/audit-2024-01-15.log
```

**Buscar logs de un usuario:**
```bash
# Buscar en todos los archivos de audit
grep "UserID:5" logs/audit-*.log

# Windows PowerShell
Select-String -Path "logs\audit-*.log" -Pattern "UserID:5"
```

**Contar errores por día:**
```bash
# Linux/Mac
for file in logs/error-*.log; do
  echo "$file: $(wc -l < $file) errores"
done

# Windows PowerShell
Get-ChildItem logs\error-*.log | ForEach-Object {
  $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
  Write-Host "$($_.Name): $lines errores"
}
```

**Limpiar logs antiguos manualmente:**
```bash
# Eliminar logs de hace más de 30 días
find logs/ -name "*.log" -mtime +30 -delete
```

#### 12. Ventajas de Winston sobre sistema custom:

1. **Mantenibilidad:**
   - Código reducido de ~286 líneas a ~150 líneas
   - Sin código de rotación manual
   - Sin manejo de fs errors

2. **Escalabilidad:**
   - Múltiples transportes en paralelo
   - Fácil agregar nuevos destinos (BD, servicios externos)
   - Sin límites de tamaño (delegado a Winston)

3. **Observabilidad:**
   - 5 niveles de log vs 2
   - Formato colorizado en consola
   - Integración con dashboards profesionales

4. **Producción:**
   - Librería probada en millones de aplicaciones
   - Actualizaciones de seguridad automáticas (npm update)
   - Documentación extensa y comunidad activa

5. **DevOps:**
   - Rotación automática por fecha (estándar industria)
   - Nombres predecibles para scripts de backup
   - Limpieza automática de logs antiguos

#### 13. Estructura de archivos final:

```
auth/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js      (taskId: AS-TASK-13)
│   ├── middleware/
│   │   └── auditMiddleware.js      (sin cambios, usa abstracción)
│   ├── utils/
│   │   └── logger.js               (AS-TASK-13: Winston implementation)
│   └── routes/
│       └── auth.routes.js          (sin cambios, usa abstracción)
├── logs/
│   ├── .gitkeep
│   ├── audit-2024-01-15.log        (Winston DailyRotateFile)
│   ├── audit-2024-01-14.log
│   ├── error-2024-01-15.log        (Winston DailyRotateFile)
│   └── error-2024-01-14.log
├── package.json                     (winston + winston-daily-rotate-file)
└── .gitignore                       (sin cambios)
```

#### 14. Testing:

**Test 1: Verificar que Winston crea logs con rotación diaria**
```bash
# Hacer una operación
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "juan@innovatech.cl", "password": "password123"}'

# Verificar archivo con fecha de hoy
ls -la logs/audit-$(date +%Y-%m-%d).log

# Leer contenido
cat logs/audit-$(date +%Y-%m-%d).log | grep "LOGIN"
```

**Test 2: Verificar niveles de log**
```bash
# Buscar logs de nivel error
grep "\[ERROR\]" logs/error-*.log

# Buscar logs de nivel warning
grep "\[WARNING\]" logs/audit-*.log
```

**Test 3: Verificar que formato mantiene compatibilidad con AS-TASK-12**
```bash
# El formato debe seguir siendo:
# [OK] - Timestamp - UserID - Operación - Email - IP - Detalle - taskId

# Verificar estructura
cat logs/audit-$(date +%Y-%m-%d).log | head -1
```

**Test 4: Verificar rotación automática por tamaño**
```bash
# Simular muchos logs (script de carga)
for i in {1..10000}; do
  curl -X GET http://localhost:3000/api/auth/roles
done

# Verificar si se crearon múltiples archivos del mismo día
ls -lh logs/audit-$(date +%Y-%m-%d)*.log
# Ejemplo: audit-2024-01-15.log, audit-2024-01-15.1.log, audit-2024-01-15.2.log
```

#### 15. Variables de configuración:

**Archivo .env (opcional):**
```bash
# Nivel mínimo de log
LOG_LEVEL=info              # debug, info, warn, error

# Entorno
NODE_ENV=production         # production, development

# Configuración de rotación (opcional, ya configurado en código)
LOG_MAX_SIZE=20m            # Tamaño máximo antes de rotar
LOG_MAX_FILES=14d           # Retención de logs audit
LOG_ERROR_MAX_FILES=30d     # Retención de logs error
```

#### 16. Mejoras futuras:

1. **Log de performance:**
```javascript
logger.logPerformance({
  endpoint: '/api/auth/login',
  method: 'POST',
  responseTime: 145,
  statusCode: 200,
  userId: 5
});
```

2. **Alertas automáticas:**
```javascript
// Enviar alerta a Slack si hay más de 10 errores por minuto
if (errorCountLastMinute > 10) {
  slackClient.send('🚨 Alerta: Muchos errores en Auth Service');
}
```

3. **Dashboard en tiempo real:**
- Gráficos de operaciones/minuto
- Mapa de IPs de acceso
- Top usuarios más activos

4. **Métricas agregadas:**
```javascript
logger.logMetrics({
  totalLogins: 1523,
  failedLogins: 45,
  avgResponseTime: 67,
  period: 'last_hour'
});
```

---

