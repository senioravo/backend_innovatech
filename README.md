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