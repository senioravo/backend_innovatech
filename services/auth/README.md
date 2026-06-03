# Microservicio Auth - InnovaTech

> **Guía de estudio (presentación / aprendizaje):** [README-ESTUDIO.md](./README-ESTUDIO.md)  
> **Documentación del backend completo:** [../../README.md](../../README.md)

**Task ID:** AS-TASK-20

## Descripción

Microservicio de autenticación y autorización para la plataforma InnovaTech. Proporciona funcionalidades de registro, login, gestión de usuarios y control de acceso basado en roles (RBAC). Implementado siguiendo principios SOLID y mejores prácticas de desarrollo.

## Arquitectura

- **Framework:** Express.js v4.18.2
- **Base de datos:** PostgreSQL (Neon Cloud Database)
- **Autenticación:** JWT (JSON Web Tokens)
- **Hashing:** bcrypt con 10 salt rounds
- **Testing:** Jest v30.4.2 + Supertest v7.2.2
- **Logging:** Winston v3.19.0
- **Monitoreo:** Prometheus (prom-client v15.1.3)
- **Resiliencia:** Circuit Breaker (opossum v8.1.4)

## Requisitos Previos

### Software Requerido

- **Node.js:** v22.19.0 o superior
- **npm:** v10.x o superior
- **PostgreSQL:** Neon Cloud Database (o PostgreSQL local v14+)
- **Docker:** (Opcional) Para contenedores y Grafana
- **Git:** Para control de versiones

### Configuración de Base de Datos

El microservicio está configurado para usar **Neon PostgreSQL** (database-as-a-service). Alternativamente, puede usar una instancia local de PostgreSQL.

#### Opción 1: Neon Cloud (Recomendado)
1. Crear cuenta en [Neon.tech](https://neon.tech)
2. Crear un nuevo proyecto
3. Copiar la cadena de conexión `DATABASE_URL`

#### Opción 2: PostgreSQL Local
1. Instalar PostgreSQL 14+
2. Crear base de datos: `createdb innovatech_auth`
3. Configurar credenciales en `.env`

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/senioravo/backend_innovatech.git
cd backend_innovatech/services/auth
```

### 2. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias definidas en `package.json`:
- express v4.18.2
- pg v8.20.0 (PostgreSQL client)
- bcrypt v6.0.0
- jsonwebtoken v9.0.3
- winston v3.19.0
- prom-client v15.1.3
- opossum v8.1.4
- dotenv v16.3.1

**Dependencias de desarrollo:**
- jest v30.4.2
- supertest v7.2.2
- nodemon v3.0.1

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de Datos (Opción 1: Neon/Cloud)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Base de Datos (Opción 2: Local)
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=tu_password
# DB_NAME=innovatech_auth

# JWT
JWT_SECRET=innovatech_secret_key_2026_change_in_production
JWT_EXPIRES_IN=1h

# Seguridad
BCRYPT_SALT_ROUNDS=10
```

### 4. Inicializar Base de Datos

Ejecutar el schema SQL para crear las tablas:

```bash
node -e "const {pool}=require('./src/config/database');const fs=require('fs');(async()=>{const sql=fs.readFileSync('./database/schema.sql','utf8');await pool.query(sql);console.log(' Schema creado');process.exit(0);})();"
```

O ejecutar manualmente:

```bash
psql $DATABASE_URL -f database/schema.sql
```

## Ejecución del Servicio

### Modo Desarrollo (con hot-reload)

```bash
npm run dev
```

### Modo Producción

```bash
npm start
```

Salida esperada:

```
[BLACKLIST] Limpieza automática iniciada (cada 1 hora)
[2026-05-13 00:29:01] info: [LOGGER] Winston inicializado - Directorio: /path/to/logs
Microservicio Auth ejecutándose en puerto 3001
```

El servicio estará disponible en `http://localhost:3001`

##  Pruebas Automatizadas

### Ejecutar Suite Completa de Tests

```bash
npm test
```

### Ejecutar Tests con Cobertura

```bash
npm test -- --coverage
```

### Ejecutar Tests en Modo Watch

```bash
npm test -- --watch
```

### Suite de Tests Implementada

El microservicio cuenta con **119 tests** distribuidos en 3 suites:

#### AS-TASK-16: Tests de Integración (59 tests)
- **auth.routes.test.js**: Tests de endpoints REST
  - Registro de usuarios
  - Login y autenticación
  - Gestión de tokens
  - Validaciones de entrada
  - Manejo de errores

#### AS-TASK-17: Tests de Seguridad (23 tests)
- **bcrypt.test.js**: Verificación de hashing
  - Hashing de contraseñas
  - Comparación segura
  - Salt rounds configurables
  - Validación de roles en schema

#### AS-TASK-18: Tests de Validación (37 tests)
- **response-validation.test.js**: Validación de respuestas
  - Códigos HTTP correctos
  - Estructura JSON consistente
  - Mensajes de error descriptivos
  - Campos `success`, `message`, `taskId`, `data`

### Ejemplo de Salida de Tests

```
PASS  src/routes/__tests__/auth.routes.test.js
  Microservicio Auth - Endpoints
    POST /api/auth/register
      ✓ debe registrar un nuevo usuario exitosamente (145ms)
      ✓ debe validar email duplicado (89ms)
      ✓ debe validar formato de email (34ms)
      ✓ debe validar contraseña robusta (28ms)
      ✓ debe validar rol permitido (31ms)
    POST /api/auth/login
      ✓ debe autenticar usuario con credenciales válidas (112ms)
      ✓ debe rechazar credenciales inválidas (87ms)
      ✓ debe generar token JWT válido (95ms)

PASS  src/utils/__tests__/bcrypt.test.js
  bcrypt Security Tests
    Password Hashing
      ✓ debe hashear contraseña correctamente (156ms)
      ✓ debe generar hash diferente en cada ejecución (178ms)
      ✓ debe verificar contraseña correcta (145ms)
      ✓ debe rechazar contraseña incorrecta (142ms)

PASS  src/controllers/__tests__/response-validation.test.js
  Response Validation Tests
    JSON Structure
      ✓ debe retornar estructura JSON válida (45ms)
      ✓ debe incluir campo success booleano (23ms)
      ✓ debe incluir mensaje descriptivo (28ms)
      ✓ debe incluir taskId en todas las respuestas (31ms)

Test Suites: 3 passed, 3 total
Tests:       119 passed, 119 total
Snapshots:   0 total
Time:        8.234s
```

### Reporte de Cobertura

```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |   94.23 |    89.15 |   96.47 |   94.51 |
 controllers        |   96.12 |    91.23 |   98.21 |   96.34 |
  auth.controller.js|   96.12 |    91.23 |   98.21 |   96.34 | 145,201
 routes             |   95.87 |    88.92 |   97.14 |   95.98 |
  auth.routes.js    |   95.87 |    88.92 |   97.14 |   95.98 | 67,134
 utils              |   91.45 |    85.71 |   93.75 |   91.67 |
  bcrypt.js         |   91.45 |    85.71 |   93.75 |   91.67 | 34,56
 config             |   89.23 |    82.14 |   91.43 |   89.56 |
  database.js       |   89.23 |    82.14 |   91.43 |   89.56 | 78,102
--------------------|---------|----------|---------|---------|-------------------
```

##  Monitoreo y Métricas

### Prometheus Metrics

El microservicio expone métricas en formato Prometheus para monitoreo en tiempo real.

#### Endpoint de Métricas

```
GET http://localhost:3001/metrics
```

#### Métricas Disponibles

**Métricas HTTP:**
- `http_request_duration_seconds` - Duración de requests HTTP (histogram)
- `http_requests_total` - Total de requests por método y ruta (counter)
- `http_request_size_bytes` - Tamaño de requests (histogram)
- `http_response_size_bytes` - Tamaño de responses (histogram)

**Métricas de Base de Datos:**
- `db_query_duration_seconds` - Duración de queries SQL (histogram)
- `db_connections_active` - Conexiones activas al pool (gauge)
- `db_connections_total` - Total de conexiones creadas (counter)
- `db_query_errors_total` - Errores en queries (counter)

**Métricas de Autenticación:**
- `auth_register_total` - Total de registros (counter)
- `auth_login_attempts_total` - Intentos de login (counter)
- `auth_login_failures_total` - Logins fallidos (counter)
- `auth_token_generated_total` - Tokens JWT generados (counter)

**Métricas de Circuit Breaker:**
- `circuit_breaker_state` - Estado del circuit breaker (gauge)
- `circuit_breaker_failures_total` - Fallos del circuito (counter)

#### Ejemplo de Métricas

```prometheus
# HELP http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1",method="POST",route="/api/auth/register",status="201"} 145
http_request_duration_seconds_bucket{le="0.5",method="POST",route="/api/auth/register",status="201"} 158
http_request_duration_seconds_sum{method="POST",route="/api/auth/register",status="201"} 12.456
http_request_duration_seconds_count{method="POST",route="/api/auth/register",status="201"} 160

# HELP auth_login_attempts_total Total login attempts
# TYPE auth_login_attempts_total counter
auth_login_attempts_total{status="success"} 1234
auth_login_attempts_total{status="failed"} 89
```

### Integración con Prometheus

#### 1. Configurar Prometheus

Crear archivo `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'auth-microservice'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
```

#### 2. Ejecutar Prometheus con Docker

```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

Acceder a Prometheus UI: `http://localhost:9090`

### Visualización con Grafana

#### 1. Ejecutar Grafana con Docker

```bash
docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana
```

#### 2. Configurar Dashboard

1. Acceder a `http://localhost:3000` (admin/admin)
2. Agregar Prometheus como datasource (`http://prometheus:9090`)
3. Importar dashboard de Node.js (ID: 11159)
4. Crear panel personalizado con queries:

**Requests por Segundo:**
```promql
rate(http_requests_total[5m])
```

**Duración Promedio de Requests:**
```promql
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

**Tasa de Errores:**
```promql
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
```

## 🔐 Sistema de Roles

### Roles Disponibles

El microservicio implementa control de acceso basado en roles (RBAC) con 3 roles predefinidos:

#### 1. **Gestor**
- **Descripción:** Administrador del sistema con permisos completos
- **Permisos:**
  - Gestión de usuarios (CRUD)
  - Configuración del sistema
  - Acceso a métricas y logs
  - Gestión de roles y permisos

#### 2. **Profesional**
- **Descripción:** Usuario técnico con permisos operativos
- **Permisos:**
  - Lectura de usuarios
  - Actualización de perfil propio
  - Acceso a funcionalidades principales
  - Visualización de reportes

#### 3. **Directivo**
- **Descripción:** Usuario ejecutivo con permisos de visualización
- **Permisos:**
  - Lectura de usuarios
  - Visualización de dashboards
  - Acceso a reportes ejecutivos
  - Sin permisos de modificación

### Validación de Roles

Los roles son validados a nivel de:

1. **Base de Datos:** Constraint CHECK en columna `rol`
   ```sql
   rol VARCHAR(50) NOT NULL CHECK (rol IN ('gestor', 'profesional', 'directivo'))
   ```

2. **Middleware:** Validación en requests
   ```javascript
   const ROLES = {
     GESTOR: 'gestor',
     PROFESIONAL: 'profesional',
     DIRECTIVO: 'directivo'
   };
   ```

3. **Tests:** Suite completa de validación de roles
   - 23 tests específicos para roles
   - Validación de casos edge
   - Tests de integridad de datos

### Ejemplo de Uso

**Registro con Rol:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@innovatech.cl",
    "password": "Secure123!",
    "rol": "profesional"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "taskId": "AS-TASK-13",
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@innovatech.cl",
    "rol": "profesional",
    "createdAt": "2026-05-13T08:29:22.996Z"
  }
}
```

##  API Endpoints

### POST /api/auth/register
Registrar nuevo usuario

**Request:**
```json
{
  "nombre": "string",
  "email": "string",
  "password": "string",
  "rol": "gestor|profesional|directivo"
}
```

**Response:** 201 Created

### POST /api/auth/login
Autenticar usuario

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** 200 OK + JWT Token

### POST /api/auth/logout
Cerrar sesión (invalidar token)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** 200 OK

### GET /api/auth/roles
Obtener roles disponibles

**Response:** 200 OK + Lista de roles

### GET /metrics
Métricas de Prometheus

**Response:** 200 OK (text/plain)

### GET /health
Health check del servicio

**Response:** 200 OK

##  Principios SOLID

El microservicio está diseñado siguiendo los principios SOLID:

### S - Single Responsibility Principle
Cada módulo tiene una única responsabilidad:
- **Controllers:** Lógica de negocio
- **Routes:** Definición de endpoints
- **Middleware:** Validaciones y transformaciones
- **Config:** Configuración y conexiones

### O - Open/Closed Principle
El código está abierto para extensión, cerrado para modificación:
- Uso de middleware extensible
- Configuración mediante variables de entorno
- Validadores reutilizables

### L - Liskov Substitution Principle
Las abstracciones son reemplazables:
- Pool de conexiones PostgreSQL intercambiable
- Logger puede usar Winston o alternativas
- Hashing puede cambiar de bcrypt a alternativas

### I - Interface Segregation Principle
Interfaces específicas para cada cliente:
- Separación de rutas públicas y protegidas
- Middleware específico por endpoint
- Configuración modular

### D - Dependency Inversion Principle
Dependencias de abstracciones, no implementaciones:
- Inyección de dependencias en controllers
- Configuración externa (.env)
- Pool de BD abstracto

##  Estructura del Proyecto

```
services/auth/
├── src/
│   ├── config/
│   │   ├── database.js         # Configuración PostgreSQL
│   │   └── roles.js            # Definición de roles
│   ├── controllers/
│   │   ├── auth.controller.js  # Lógica de autenticación
│   │   └── __tests__/          # Tests de controllers
│   ├── middleware/
│   │   ├── auth.middleware.js  # Validación de JWT
│   │   ├── metrics.middleware.js # Prometheus metrics
│   │   └── logger.middleware.js  # Winston logging
│   ├── routes/
│   │   ├── auth.routes.js      # Definición de endpoints
│   │   └── __tests__/          # Tests de routes
│   ├── utils/
│   │   ├── bcrypt.js           # Utilidades de hashing
│   │   ├── jwt.js              # Utilidades de tokens
│   │   └── __tests__/          # Tests de utilidades
│   └── app.js                  # Aplicación Express
├── database/
│   └── schema.sql              # Schema PostgreSQL
├── logs/                       # Winston logs (gitignored)
├── .env                        # Variables de entorno (gitignored)
├── .env.example                # Template de configuración
├── package.json                # Dependencias npm
├── jest.config.js              # Configuración Jest
└── README.md                   # Esta documentación
```

##  Seguridad

- **Hashing de contraseñas:** bcrypt con 10 salt rounds
- **Tokens JWT:** Firmados con HS256, expiración de 1 hora
- **SSL/TLS:** Conexiones seguras a PostgreSQL (Neon)
- **Validación de entrada:** Sanitización de datos
- **Rate limiting:** Circuit breaker para prevenir sobrecarga
- **Blacklist de tokens:** Invalidación de tokens en logout

##  Logs

Los logs se almacenan en el directorio `logs/` con rotación automática:

```
logs/
├── error-2026-05-13.log    # Solo errores
├── combined-2026-05-13.log # Todos los logs
└── exceptions.log          # Excepciones no capturadas
```

**Formato:**
```
[2026-05-13 00:29:01] info: [AUTH] Usuario registrado - ID: 1
[2026-05-13 00:30:15] info: [AUTH] Login exitoso - Email: test@innovatech.cl
[2026-05-13 00:31:42] error: [DB] Error de conexión - ECONNREFUSED
```

##  Docker (Próximamente)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

##  Contribución

1. Fork del repositorio
2. Crear branch feature: `git checkout -b feature/AS-TASK-XX`
3. Commit cambios: `git commit -m 'feat: descripción'`
4. Push al branch: `git push origin feature/AS-TASK-XX`
5. Crear Pull Request a `develop`

##  Licencia

MIT © 2026 InnovaTech

##  Equipo

Desarrollado por el equipo de InnovaTech

---

**Task ID:** AS-TASK-20 - Documentación README.md del Microservicio Auth
