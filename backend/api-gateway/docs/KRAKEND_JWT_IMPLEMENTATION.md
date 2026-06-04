# Guía de Implementación: KrakenD + JWT RS256

## Tabla de Contenidos

1. [¿Qué es KrakenD?](#qué-es-krakend)
2. [¿Por qué KrakenD en el API Gateway?](#por-qué-krakend-en-el-api-gateway)
3. [Arquitectura](#arquitectura)
4. [JWT con RSA (RS256)](#jwt-con-rsa-rs256)
5. [Configuración](#configuración)
6. [Flujo de Autenticación](#flujo-de-autenticación)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## ¿Qué es KrakenD?

**KrakenD** es un API Gateway de alto rendimiento y código abierto diseñado específicamente para arquitecturas de microservicios. Sus características principales:

- ✅ **Validación JWT nativa** (RS256, HS256, ES256)
- ✅ **Propagación de claims** como headers HTTP
- ✅ **Rate limiting** y circuit breakers incorporados
- ✅ **CORS** configurable
- ✅ **Agregación de respuestas** de múltiples backends
- ✅ **Sin estado** (stateless) - perfecto para contenedores
- ✅ **Alto rendimiento** (escrito en Go)

---

## ¿Por qué KrakenD en el API Gateway?

### Problema Anterior

Con nginx + BFF validando JWT:

```
Cliente → nginx → BFF (valida JWT) → ms-auth / ms-project-manager
                   ↑
              Responsabilidad 
              de seguridad
```

**Problemas:**
- ❌ BFF tenía responsabilidad de seguridad (debería ser solo transformación)
- ❌ Código de validación JWT duplicado en cada servicio
- ❌ nginx solo hacía proxy (no validaba JWT)
- ❌ Difícil implementar rate limiting por usuario

### Solución con KrakenD

```
Cliente → KrakenD (valida JWT) → BFF (confía en headers) → ms-auth / ms-project-manager
          ↑
     Validación centralizada
     Headers: X-User-Id, X-User-Email, X-User-Role
```

**Beneficios:**
- ✅ **Separación de responsabilidades**: Gateway valida, BFF transforma
- ✅ **Seguridad centralizada**: Un solo punto valida JWT
- ✅ **BFF simplificado**: Solo lee headers (código más simple)
- ✅ **RBAC en gateway**: KrakenD rechaza usuarios sin rol adecuado
- ✅ **Rate limiting**: Por usuario, no por IP
- ✅ **Logs centralizados**: Todas las peticiones pasan por un punto

---

## Arquitectura

### Diagrama de Flujo

```mermaid
sequenceDiagram
    participant Cliente
    participant KrakenD
    participant ms-auth
    participant BFF
    participant ms-project-manager

    Note over Cliente,ms-project-manager: 1. Login (sin JWT)
    Cliente->>KrakenD: POST /api/v1/auth/login
    KrakenD->>BFF: POST /api/auth/login
    BFF->>ms-auth: POST /api/auth/login
    ms-auth-->>BFF: token JWT (firmado con private.key)
    BFF-->>KrakenD: token JWT
    KrakenD-->>Cliente: token JWT

    Note over Cliente,ms-project-manager: 2. Petición protegida (con JWT)
    Cliente->>KrakenD: GET /api/v1/projects<br/>Authorization: Bearer {token}
    
    Note over KrakenD: Valida JWT con<br/>clave pública (JWKS)
    KrakenD->>ms-auth: GET /.well-known/jwks.json
    ms-auth-->>KrakenD: Clave pública RSA
    
    Note over KrakenD: JWT válido<br/>Extrae claims
    KrakenD->>BFF: GET /api/v1/projects<br/>X-User-Id: 123<br/>X-User-Email: user@example.com<br/>X-User-Role: gestor
    
    BFF->>ms-project-manager: GET /api/v1/projects
    ms-project-manager-->>BFF: Lista de proyectos
    BFF-->>KrakenD: Lista transformada
    KrakenD-->>Cliente: Lista de proyectos
```

### Componentes

| Componente | Puerto | Responsabilidad |
|-----------|--------|----------------|
| **KrakenD** | 8080 (expuesto 8010) | Validar JWT, CORS, rate limiting, routing |
| **ms-auth** | 3001 | Generar JWT (firmar con clave privada), servir JWKS |
| **BFF** | 3010 | Transformar datos, orquestar llamadas |
| **ms-project-manager** | 3002 | Lógica de negocio de proyectos |

---

## JWT con RSA (RS256)

### ¿Por qué RSA en lugar de HS256?

| Aspecto | HS256 (Simétrico) | RS256 (Asimétrico) |
|---------|-------------------|-------------------|
| **Claves** | Una sola (JWT_SECRET) | Par público/privado |
| **Firma** | Cualquier servicio con el secret | Solo quien tiene private.key |
| **Verificación** | Cualquier servicio con el secret | Cualquiera con public.key |
| **Seguridad** | ❌ Cualquier servicio puede falsificar tokens | ✅ Solo ms-auth puede crear tokens |
| **Distribución** | ❌ Secret compartido (riesgo) | ✅ Pública se puede compartir libremente |

### Flujo RSA

```
┌─────────────┐
│   ms-auth   │
│             │
│ private.key │──┐ Firma JWT
│ public.key  │  │
└─────────────┘  │
                 │
                 ▼
            ┌────────┐
            │  JWT   │
            │ (token)│
            └────────┘
                 │
                 │ Envía al cliente
                 ▼
            ┌─────────┐
            │ Cliente │
            └─────────┘
                 │
                 │ Envía en peticiones
                 ▼
            ┌──────────┐
            │ KrakenD  │
            │          │
            │ Descarga │
            │ public.key ───┐ Verifica JWT
            │ desde JWKS    │
            └──────────┘    │
                           │
                           ▼
                      ┌─────────┐
                      │ ✅ OK   │
                      │ Headers │
                      └─────────┘
                           │
                           ▼
                      ┌─────────┐
                      │   BFF   │
                      └─────────┘
```

---

## Configuración

### 1. Generar Claves RSA

```bash
cd backend/ms-auth
node scripts/generate-keys.js
```

Genera:
- `keys/private.key` (2048 bits) - Solo ms-auth tiene acceso
- `keys/public.key` - Se sirve vía JWKS

### 2. Endpoint JWKS en ms-auth

**Archivo:** `backend/ms-auth/src/routes/jwks.routes.ts`

```typescript
router.get('/.well-known/jwks.json', (req, res) => {
  const publicKeyPEM = fs.readFileSync('./keys/public.key', 'utf8');
  const publicKey = crypto.createPublicKey(publicKeyPEM);
  const jwk = publicKey.export({ format: 'jwk' });
  
  res.json({
    keys: [{
      ...jwk,
      alg: 'RS256',
      use: 'sig',
      kid: 'innovatech-auth-key-1'
    }]
  });
});
```

**Verificar:**
```bash
curl http://localhost:3001/.well-known/jwks.json
```

### 3. Configuración KrakenD

**Archivo:** `backend/api-gateway/krakend.json`

```json
{
  "endpoint": "/api/v1/projects",
  "method": "GET",
  "extra_config": {
    "auth/validator": {
      "alg": "RS256",
      "jwk_url": "http://krakend:8080/.well-known/jwks.json",
      "cache": true,
      "cache_duration": 300,
      "disable_jwk_security": true,
      "propagate_claims": [
        ["id", "x-user-id"],
        ["email", "x-user-email"],
        ["rol", "x-user-role"]
      ],
      "roles_key": "rol",
      "roles": ["gestor", "directivo"]
    }
  }
}
```

**Parámetros importantes:**
- `jwk_url`: URL donde KrakenD descarga la clave pública
- `cache_duration`: Segundos para cachear JWKS (evita descargas constantes)
- `disable_jwk_security`: `true` para desarrollo local (Docker)
- `propagate_claims`: Mapea claims JWT → headers HTTP
- `roles`: Lista de roles permitidos para este endpoint

### 4. BFF Simplificado

**Antes (validaba JWT):**
```typescript
const jwt = require('jsonwebtoken');
const publicKey = fs.readFileSync('./keys/public.key');

function jwtAuthMiddleware(req, res, next) {
  const token = req.headers.authorization?.slice(7);
  const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
  req.user = decoded;
  next();
}
```

**Ahora (confía en gateway):**
```typescript
function jwtAuthMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];
  
  if (!userId || !userEmail || !userRole) {
    return res.status(401).json({ 
      error: 'Must be accessed through API Gateway' 
    });
  }
  
  req.user = {
    id: parseInt(userId),
    email: userEmail,
    role: userRole
  };
  next();
}
```

### 5. Docker Compose

```yaml
services:
  api-gateway:
    image: devopsfaith/krakend:2.7
    ports:
      - "8010:8080"
    volumes:
      - ./api-gateway/krakend.json:/etc/krakend/krakend.json:ro
    command: ["run", "-c", "/etc/krakend/krakend.json"]
    depends_on:
      - bff
      - auth

  auth:
    build: ./ms-auth
    volumes:
      - ./ms-auth/keys/private.key:/app/keys/private.key:ro
      - ./ms-auth/keys/public.key:/app/keys/public.key:ro
    expose:
      - "3001"

  bff:
    build: ./bff
    # YA NO necesita volumen con public.key
    expose:
      - "3010"
```

---

## Flujo de Autenticación

### 1. Login (sin JWT)

```bash
POST http://localhost:8010/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@innovatech.com",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@innovatech.com",
    "role": "gestor"
  }
}
```

### 2. Petición Protegida

```bash
GET http://localhost:8010/api/v1/projects
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Flujo interno:**

1. **KrakenD recibe petición**
   - Extrae token del header `Authorization`
   - Consulta JWKS endpoint (si no está cacheado)

2. **KrakenD valida JWT**
   - Verifica firma con clave pública
   - Verifica expiración
   - Verifica rol (si configurado)

3. **KrakenD propaga claims**
   ```
   X-User-Id: 1
   X-User-Email: admin@innovatech.com
   X-User-Role: gestor
   ```

4. **BFF recibe headers**
   - Lee `X-User-*` directamente
   - No valida JWT (confía en gateway)

### 3. Petición Rechazada

```bash
GET http://localhost:8010/api/v1/projects/{id}
# Sin Authorization header
```

**Respuesta KrakenD:**
```json
{
  "error": "Unauthorized",
  "status": 401
}
```

---

## Testing

### 1. Verificar JWKS

```bash
# Desde el contenedor de ms-auth
curl http://ms-auth:3001/.well-known/jwks.json

# Desde KrakenD (debe funcionar)
docker exec -it backend-api-gateway-1 sh
wget -O- http://ms-auth:3001/.well-known/jwks.json
```

**Respuesta esperada:**
```json
{
  "keys": [{
    "kty": "RSA",
    "n": "...",
    "e": "AQAB",
    "alg": "RS256",
    "use": "sig",
    "kid": "innovatech-auth-key-1"
  }]
}
```

### 2. Login y Obtener Token

```bash
TOKEN=$(curl -s -X POST http://localhost:8010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@innovatech.com","password":"admin123"}' \
  | jq -r '.token')

echo $TOKEN
```

### 3. Usar Token en Petición Protegida

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8010/api/v1/projects
```

### 4. Verificar Headers en BFF

Agregar log en `bff/src/presentation/http/middlewares/jwtAuthMiddleware.ts`:

```typescript
console.log('Headers recibidos:', {
  userId: req.headers['x-user-id'],
  userEmail: req.headers['x-user-email'],
  userRole: req.headers['x-user-role']
});
```

---

## Troubleshooting

### Error: `jwk_url` unreachable

**Síntoma:**
```
[KRAKEND] ERROR: Unable to fetch JWKS from http://krakend:8080/.well-known/jwks.json
```

**Causa:** KrakenD intenta consumir su propio puerto (loop infinito)

**Solución:** Cambiar URL a servicio interno:
```json
"jwk_url": "http://ms-auth:3001/.well-known/jwks.json"
```

### Error: BFF recibe JWT sin headers

**Síntoma:**
```typescript
req.headers['x-user-id'] === undefined
```

**Causa:** `propagate_claims` mal configurado

**Solución:** Verificar mapeo en `krakend.json`:
```json
"propagate_claims": [
  ["id", "x-user-id"],      // claim "id" → header "x-user-id"
  ["email", "x-user-email"],
  ["rol", "x-user-role"]    // ¡Nota: "rol" no "role"!
]
```

### Error: Token válido rechazado

**Síntoma:**
```
401 Unauthorized (pero token es correcto)
```

**Causa:** Rol no permitido o `roles_key` incorrecto

**Solución:** Verificar payload JWT:
```bash
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq
```

Si el claim es `"rol": "gestor"`, configurar:
```json
"roles_key": "rol",  // NO "role"
"roles": ["gestor", "directivo"]
```

### Error: CORS

**Síntoma:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución:** Agregar CORS global en `krakend.json`:
```json
{
  "extra_config": {
    "security/cors": {
      "allow_origins": ["http://localhost:5173"],
      "allow_methods": ["GET", "POST", "PUT", "DELETE"],
      "allow_headers": ["Authorization", "Content-Type"],
      "expose_headers": ["Content-Length"],
      "max_age": "12h"
    }
  }
}
```

### BFF expuesto directamente (sin gateway)

**Síntoma:** Headers `X-User-*` vacíos cuando se llama directamente al BFF

**Causa:** BFF debe estar detrás de KrakenD siempre

**Solución:** 
1. Configurar firewall/network para que BFF no sea accesible públicamente
2. En Docker: no exponer puerto BFF externamente (solo `expose`, no `ports`)

```yaml
bff:
  expose:
    - "3010"  # Accesible solo dentro de Docker network
  # NO usar:
  # ports:
  #   - "3010:3010"  ❌ Esto expone BFF públicamente
```

---

## Recursos

- [KrakenD Documentation](https://www.krakend.io/docs/)
- [KrakenD JWT Validation](https://www.krakend.io/docs/authorization/jwt-validation/)
- [RFC 7517 - JSON Web Key (JWK)](https://datatracker.ietf.org/doc/html/rfc7517)
- [RFC 7519 - JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)

---

## Conclusión

La implementación de KrakenD con JWT RS256 proporciona:

✅ **Seguridad mejorada**: Validación centralizada con claves asimétricas  
✅ **Arquitectura limpia**: Separación de responsabilidades  
✅ **BFF simplificado**: Código más mantenible  
✅ **Escalabilidad**: KrakenD maneja rate limiting y cache  
✅ **Observabilidad**: Logs centralizados en un punto  

Esta arquitectura sigue las mejores prácticas de microservicios y está lista para producción.
