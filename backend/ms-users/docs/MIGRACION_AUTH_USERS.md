# Guía de Migración: Separación de Auth y Users

## 📋 Resumen

Esta guía documenta la separación del microservicio `ms-auth` en dos servicios independientes:
- **ms-auth**: Solo autenticación (login, logout, JWT)
- **ms-users**: Solo gestión de usuarios (CRUD, perfiles, roles)

## ✅ Completado

- [x] Crear estructura completa de `ms-users`
- [x] Implementar CRUD de usuarios en `ms-users`
- [x] Configurar verificación de JWT con clave pública
- [x] Agregar `ms-users` a `docker-compose.yml`
- [x] Documentación completa del nuevo servicio

## 🔄 Próximos Pasos

### 1. Actualizar Base de Datos

#### Opción A: Misma base de datos (Recomendado para desarrollo)
```bash
# ms-auth y ms-users comparten la misma tabla usuarios
# No requiere cambios - ambos servicios usan DATABASE_URL_AUTH
```

Actualizar `.env.docker`:
```env
DATABASE_URL_USERS=${DATABASE_URL_AUTH}
```

#### Opción B: Base de datos separada (Recomendado para producción)
```bash
# Crear nueva base de datos en Neon para ms-users
# Ejecutar schema: backend/ms-users/database/schema.sql
# Migrar datos existentes de usuarios si es necesario
```

### 2. Actualizar ms-auth (Eliminar lógica de usuarios)

#### Endpoints a ELIMINAR de ms-auth:
```javascript
// ❌ Eliminar de ms-auth/src/routes/auth.routes.ts
router.post('/register')              // → Mover a ms-users
router.get('/usuarios/:id')           // → Mover a ms-users
router.put('/usuarios/:id/rol')       // → Mover a ms-users
```

#### Endpoints a MANTENER en ms-auth:
```javascript
// ✅ Mantener en ms-auth/src/routes/auth.routes.ts
router.post('/login')                 // Autenticación
router.post('/logout')                // Cerrar sesión
router.get('/roles')                  // Información de roles (lectura)
router.get('/roles/simple')           // Roles simplificados
router.get('/.well-known/jwks.json')  // Claves públicas JWT
router.get('/health')                 // Health check
```

#### Modificación en `/login`:
```javascript
// ms-auth/src/controllers/auth.controller.ts

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ✅ Llamar a ms-users para obtener datos del usuario
    const userResponse = await fetch(`http://users:3003/api/users/email/${email}`, {
      headers: {
        'Authorization': `Bearer ${INTERNAL_SERVICE_TOKEN}` // Token de servicio interno
      }
    });
    
    if (!userResponse.ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const userData = await userResponse.json();
    const user = userData.data.user;
    
    // Verificar password (todavía se hace en ms-auth por seguridad)
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const token = jwtHelper.generateToken(user);
    
    res.json({ success: true, token, user });
  } catch (error) {
    // ...
  }
};
```

#### Alternativa: Mantener tabla usuarios en ms-auth solo para login
```javascript
// ms-auth mantiene una copia de email+password para login
// ms-users gestiona el resto de datos (nombre, rol, etc.)
// Requiere sincronización entre servicios
```

### 3. Actualizar BFF

#### Modificar rutas en BFF:
```javascript
// backend/bff/src/application/auth/authService.ts

// ❌ ANTES: Todo a ms-auth
const registerUser = async (userData) => {
  return await fetch(`${AUTH_SERVICE_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

// ✅ DESPUÉS: Separar responsabilidades
const registerUser = async (userData) => {
  // Crear usuario en ms-users
  return await fetch(`${USERS_SERVICE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
};

const loginUser = async (credentials) => {
  // Login sigue en ms-auth
  return await fetch(`${AUTH_SERVICE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

const getUserProfile = async (userId, token) => {
  // Obtener perfil desde ms-users
  return await fetch(`${USERS_SERVICE_URL}/api/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
```

#### Agregar variable de entorno al BFF:
```env
USERS_SERVICE_BASE_URL=http://users:3003
USERS_API_PREFIX=/api/users
```

### 4. Actualizar API Gateway (KrakenD)

#### Agregar rutas en `krakend.json`:
```json
{
  "endpoint": "/api/v1/users",
  "method": "GET",
  "backend": [
    {
      "url_pattern": "/api/users",
      "host": ["http://users:3003"],
      "method": "GET"
    }
  ],
  "extra_config": {
    "auth/validator": {
      "alg": "RS256",
      "jwk_url": "http://auth:3001/.well-known/jwks.json"
    }
  }
}
```

Agregar endpoints para:
- `GET /api/v1/users` - Listar usuarios
- `GET /api/v1/users/:id` - Obtener usuario
- `POST /api/v1/users` - Crear usuario
- `PUT /api/v1/users/:id` - Actualizar usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario
- `PUT /api/v1/users/:id/role` - Cambiar rol

### 5. Actualizar Frontend

#### Modificar llamadas API:
```javascript
// frontend/src/api/bffClient.js

// ✅ Registro ahora va a /users (a través del BFF)
export const registerUser = async (userData) => {
  return await api.post('/api/v1/users', userData);
};

// ✅ Login sigue igual (va a /auth)
export const loginUser = async (credentials) => {
  return await api.post('/api/v1/auth/login', credentials);
};

// ✅ Obtener perfil desde /users
export const getUserProfile = async (userId) => {
  return await api.get(`/api/v1/users/${userId}`);
};

// ✅ Actualizar perfil desde /users
export const updateUserProfile = async (userId, data) => {
  return await api.put(`/api/v1/users/${userId}`, data);
};
```

## 🔐 Consideraciones de Seguridad

### Comunicación entre ms-auth y ms-users

#### Opción 1: Token de servicio interno (Recomendado)
```javascript
// Crear token especial para comunicación entre servicios
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN;

// ms-auth llama a ms-users con este token
fetch(`http://users:3003/api/users/email/${email}`, {
  headers: {
    'Authorization': `Bearer ${INTERNAL_SERVICE_TOKEN}`,
    'X-Service-Name': 'ms-auth'
  }
});
```

#### Opción 2: Endpoint interno sin autenticación
```javascript
// ms-users expone endpoint solo accesible desde red interna
// GET /internal/users/email/:email (sin autenticación)
// Solo accesible desde otros servicios, no desde API Gateway
```

#### Opción 3: Mantener datos de login en ms-auth
```javascript
// ms-auth mantiene una tabla auth_credentials (email, password_hash)
// ms-users gestiona el resto (nombre, rol, perfil)
// No requiere comunicación entre servicios para login
```

## 🚀 Despliegue

### Desarrollo Local
```bash
# 1. Configurar DATABASE_URL_USERS en .env.docker
# 2. Levantar servicios
cd backend
docker compose --env-file .env.docker up --build

# 3. Verificar que ms-users está corriendo
curl http://localhost:8010/api/v1/users/health
```

### Producción
```bash
# 1. Crear base de datos para ms-users en Neon
# 2. Ejecutar schema.sql
# 3. Configurar variables de entorno
# 4. Desplegar ms-users
# 5. Actualizar ms-auth para llamar a ms-users
# 6. Actualizar BFF y API Gateway
# 7. Actualizar Frontend
```

## 📊 Diagrama de Arquitectura

### ANTES
```
Frontend → API Gateway → BFF → ms-auth (auth + users)
                              → ms-project-manager
```

### DESPUÉS
```
Frontend → API Gateway → BFF → ms-auth (solo auth)
                              → ms-users (solo users)
                              → ms-project-manager
                              
ms-auth → ms-users (para verificar credenciales en login)
```

## 🧪 Testing

### Probar ms-users independientemente:
```bash
# 1. Obtener token desde ms-auth
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 2. Usar token para llamar a ms-users
curl http://localhost:3003/api/users \
  -H "Authorization: Bearer {token}"

# 3. Crear usuario
curl -X POST http://localhost:3003/api/users \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","email":"juan@example.com","password":"123456","rol":"profesional"}'
```

## 📝 Checklist de Migración

- [ ] Configurar `DATABASE_URL_USERS` en `.env.docker`
- [ ] Decidir estrategia de autenticación (token interno vs endpoint interno vs tabla separada)
- [ ] Actualizar `ms-auth` para eliminar endpoints de usuarios
- [ ] Modificar `/login` en `ms-auth` para obtener datos desde `ms-users`
- [ ] Actualizar BFF para llamar a `ms-users` en operaciones CRUD
- [ ] Actualizar KrakenD para enrutar `/api/v1/users` a `ms-users`
- [ ] Actualizar Frontend para usar nuevas rutas
- [ ] Ejecutar tests end-to-end
- [ ] Documentar cambios en README principal
- [ ] Actualizar variables de entorno en producción
- [ ] Desplegar servicios en orden: ms-users → ms-auth → BFF → Gateway → Frontend

## 🎯 Beneficios de la Separación

1. **Responsabilidad Única**: Cada servicio tiene una función clara
2. **Escalabilidad**: Escalar usuarios independientemente de autenticación
3. **Mantenibilidad**: Código más enfocado y fácil de mantener
4. **Seguridad**: Separar datos sensibles de lógica de negocio
5. **Testing**: Tests más simples y específicos
6. **Despliegue**: Deployar servicios independientemente

## ❓ Preguntas Frecuentes

### ¿Debo migrar los datos de usuarios existentes?
- Si usas la **misma base de datos**: No, ambos servicios comparten la tabla
- Si usas **bases separadas**: Sí, debes migrar los datos con un script SQL

### ¿Cómo manejo el registro de usuarios?
El registro (`/register`) ahora debe ir a `ms-users` (crear usuario) y luego opcionalmente a `ms-auth` (crear credenciales).

### ¿Qué pasa con los tokens JWT existentes?
Los tokens existentes siguen siendo válidos. `ms-users` verifica tokens con la misma clave pública de `ms-auth`.

## 📚 Referencias

- [ms-users README](backend/ms-users/README.md)
- [ms-auth README](backend/ms-auth/README.md)
- [JWT RSA Migration](backend/docs/JWT_RSA_MIGRATION.md)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
