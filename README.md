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
- ✅ AS-TASK-01: Estructura base del microservicio Auth
- ✅ AS-TASK-02: Integración con API Gateway
  - Endpoints REST creados
  - Rutas con identificadores únicos (taskId)
  - Validación de respuesta JSON
  - Manejo de errores implementado
- ✅ AS-TASK-03: Circuit Breaker para llamadas internas
  - Implementado con librería Opossum
  - Timeout: 3000ms, Error Threshold: 50%
  - Fallback: "Servicio no disponible"
  - Logs para observabilidad
  - Variables de entorno configuradas
  - Trazabilidad académica completa
- ✅ AS-TASK-04: Endpoint POST /api/auth/register
  - Validación completa de campos obligatorios (nombre, email, password, rol)
  - Cifrado de contraseñas con bcrypt (SALT_ROUNDS=10)
  - Integración con PostgreSQL (tabla usuarios)
  - Verificación de email duplicado
  - Logs de auditoría para trazabilidad
  - Manejo de errores con status HTTP apropiados (400, 201, 500)
  - Principios SOLID: Separación Controller/Service
  - Formato JSON estandarizado con taskId
  - Script SQL de migración incluido (auth/database/schema.sql)
- ✅ AS-TASK-05: Endpoint POST /api/auth/login
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
- ✅ AS-TASK-06: Validación de credenciales y generación segura de JWT
  - Refactorización con arquitectura limpia (SOLID)
  - Creado `jwt.helper.js` para centralizar lógica JWT
  - Validación mejorada de formato de email
  - Validación de fortaleza de contraseña
  - Expiración más segura: 1h (configurable)
- ✅ AS-TASK-07: Endpoint POST /logout con token blacklist
  - Invalidación de tokens JWT mediante blacklist
  - Middleware de autenticación (`auth.middleware.js`)
  - Extracción de token desde header Authorization (Bearer)
  - Verificación de token y validación contra blacklist
  - Servicio de blacklist con almacenamiento en memoria
  - Limpieza automática de tokens expirados (cada 1 hora)
  - Logs de auditoría completos para logout
  - Principios SOLID: Single Responsibility y Separation of Concerns
- ✅ AS-TASK-08: Definición de roles y permisos del sistema
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
- ✅ AS-TASK-09: Middleware de autorización por rol
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
[AUTH-AUDIT] ✓ Usuario registrado exitosamente - ID: 1 - Email: juan@innovatech.cl - Rol: developer - Tiempo: 145ms
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
[AUTH-AUDIT] ✓ Login exitoso - UserID: 1 - Email: juan@innovatech.cl - Rol: developer - Tiempo: 87ms - Timestamp: 2026-05-11T14:30:00.087Z
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
[AUTH-AUDIT] ✓ Login exitoso - UserID: 1 - Email: juan@innovatech.cl - Rol: developer - Expira: 1h - Tiempo: 87ms
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
[AUTH-AUDIT] ✓ Logout exitoso - UserID: 1 - Email: maria@innovatech.cl - Token invalidado - Tiempo: 15ms - Timestamp: 2024-01-15T10:30:45.138Z

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
[AUTH-AUDIT] ✓ Rol actualizado exitosamente - UserID: 5 - Email: maria@innovatech.cl - Rol anterior: profesional - Rol nuevo: gestor - Tiempo: 45ms - Timestamp: 2024-01-15T12:30:00.045Z
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
| - crear | ✅ | ❌ | ❌ |
| - editar | ✅ | ❌ | ❌ |
| - eliminar | ✅ | ❌ | ❌ |
| - ver | ✅ | ✅ | ✅ |
| **Tareas** |
| - asignar | ✅ | ❌ | ❌ |
| - actualizar | ✅ | ✅ | ❌ |
| - ver | ✅ | ✅ | ✅ |
| **Reportes** |
| - ver | ✅ | ❌ | ✅ |
| - kpis | ❌ | ❌ | ✅ |
| - analytics | ❌ | ❌ | ✅ |
| **Usuarios** |
| - ver | ✅ | ❌ | ✅ |

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
[AUTHORIZATION-AUDIT] ✓ Acceso AUTORIZADO - UserID: 5 - Email: gestor@innovatech.cl - Rol: gestor - Módulo: proyectos - Acción: crear - Endpoint: POST /api/example/proyectos - Tiempo: 12ms - Timestamp: 2024-01-15T14:30:00.000Z
```

**Acceso bloqueado por falta de permisos:**
```
[AUTHORIZATION-AUDIT] ✗ Acceso BLOQUEADO - UserID: 7 - Email: profesional@innovatech.cl - Rol: profesional - Módulo: proyectos - Acción: crear - Endpoint: POST /api/example/proyectos - IP: ::1 - Tiempo: 8ms - Timestamp: 2024-01-15T14:31:00.000Z
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
[AUTHORIZATION-AUDIT] ✗ Error en middleware de autorización - Error: Cannot read property 'rol' of undefined - Endpoint: POST /api/example/proyectos - IP: ::1 - Timestamp: 2024-01-15T14:34:00.000Z
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
# ✅ GESTOR puede crear proyectos
curl -X POST http://localhost:3000/api/example/proyectos \
  -H "Authorization: Bearer $TOKEN_GESTOR" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Proyecto Alpha"}'

# ❌ PROFESIONAL NO puede crear proyectos (403)
curl -X POST http://localhost:3000/api/example/proyectos \
  -H "Authorization: Bearer $TOKEN_PROFESIONAL" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Proyecto Beta"}'

# ✅ PROFESIONAL puede actualizar tareas
curl -X PUT http://localhost:3000/api/example/tareas/1 \
  -H "Authorization: Bearer $TOKEN_PROFESIONAL" \
  -H "Content-Type: application/json" \
  -d '{"estado": "completado"}'

# ❌ PROFESIONAL NO puede ver KPIs (403)
curl http://localhost:3000/api/example/reportes/kpis \
  -H "Authorization: Bearer $TOKEN_PROFESIONAL"

# ✅ DIRECTIVO puede ver KPIs
curl http://localhost:3000/api/example/reportes/kpis \
  -H "Authorization: Bearer $TOKEN_DIRECTIVO"

# ✅ Todos los roles autenticados pueden ver proyectos
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