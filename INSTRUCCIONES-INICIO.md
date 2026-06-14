# 📖 Guía Completa de Inicio - Innovatech Backend

## 🎯 Resumen del Sistema

Sistema de microservicios con documentación Swagger integrada en todos los servicios.

### Servicios Disponibles

| Servicio | Puerto | Health Endpoint | Swagger UI | Swagger JSON |
|----------|--------|----------------|------------|--------------|
| **ms-auth** | 3001 | `/api/auth/health` | http://localhost:3001/api-docs | http://localhost:3001/api-docs.json |
| **ms-users** | 3003 | `/health` | http://localhost:3003/api-docs | http://localhost:3003/api-docs.json |
| **ms-project-manager** | 3002 | `/health` | http://localhost:3002/api-docs | http://localhost:3002/api-docs.json |
| **BFF** | 3010 | `/health` | http://localhost:3010/api-docs | http://localhost:3010/api-docs.json |

---

##  Opción 1: Inicio Manual (Desarrollo)

### Pre-requisitos
- Node.js 18+ instalado
- PostgreSQL o acceso a Neon Cloud (ya configurado)
- Claves RSA generadas (ver sección de Configuración)

### Pasos para Iniciar Cada Servicio

#### 1. Abrir 4 terminales diferentes (una por servicio)

#### 2. Terminal 1 - ms-auth
```powershell
cd backend\ms-auth
npm run dev
```
**Salida esperada:** `Microservicio Auth ejecutándose en puerto 3001`

#### 3. Terminal 2 - ms-users
```powershell
cd backend\ms-users
npm run dev
```
**Salida esperada:** ` Microservicio Users ejecutándose en puerto 3003`

#### 4. Terminal 3 - ms-project-manager
```powershell
cd backend\ms-project-manager
npm run dev
```
**Salida esperada:** ` Project Manager ejecutándose en puerto 3002`

#### 5. Terminal 4 - BFF
```powershell
cd backend\bff
npm run dev
```
**Salida esperada:** `BFF escuchando en puerto 3010`

### Verificación Rápida

Ejecuta este script de PowerShell para verificar que todos los servicios estén corriendo:

```powershell
@("3001/api/auth/health", "3003/health", "3002/health", "3010/health") | ForEach-Object { 
    try { 
        $r = Invoke-WebRequest -UseBasicParsing "http://localhost:$_" -TimeoutSec 2
        Write-Host "✅ $_: $($r.StatusCode)" 
    } catch { 
        Write-Host "❌ $_: no responde" 
    } 
}
```

---

##  Opción 2: Docker Compose (Producción)

### Pre-requisitos
- Docker Desktop instalado y corriendo
- Archivo `.env.docker` configurado (ver sección de Configuración)

### Iniciar todos los servicios
```powershell
cd backend
docker compose --env-file .env.docker up --build
```

### Detener todos los servicios
```powershell
docker compose down
```

### Ver logs de un servicio específico
```powershell
docker compose logs -f ms-auth
docker compose logs -f ms-users
docker compose logs -f ms-project-manager
docker compose logs -f bff
```

---

##  Configuración Inicial

### 1. Generar Claves RSA (Solo Primera Vez)

Las claves RSA son necesarias para firmar y verificar tokens JWT entre microservicios.

```powershell
cd backend\ms-auth
node .\scripts\generate-keys.js
```

Esto genera:
- `keys/private.key` (usada por ms-auth para firmar JWT)
- `keys/public.key` (copiada a todos los servicios para verificar JWT)

### 2. Configurar Base de Datos

#### Opción A: Usar Neon Cloud (Ya configurado)
Los archivos `.env.docker` ya están configurados para usar Neon Cloud.

#### Opción B: PostgreSQL Local
1. Crear base de datos `innovatech_db`
2. Ejecutar el schema SQL:
   ```powershell
   psql -U postgres -d innovatech_db -f backend\ms-auth\database\schema.sql
   ```
3. Actualizar `.env.docker` con tu conexión local:
   ```env
   DATABASE_URL_AUTH=postgresql://usuario:password@localhost:5432/innovatech_db
   DATABASE_URL_USERS=postgresql://usuario:password@localhost:5432/innovatech_db
   ```

### 3. Instalar Dependencias (Solo Primera Vez o Después de Cambios)

```powershell
cd backend\ms-auth
npm install

cd ..\ms-users
npm install

cd ..\ms-project-manager
npm install

cd ..\bff
npm install
```

---

## 🔍 Uso de Swagger

### Acceder a la Documentación Interactiva

1. **ms-auth**: http://localhost:3001/api-docs
   - Login, logout, registro
   - Gestión de roles
   - 9 endpoints documentados

2. **ms-users**: http://localhost:3003/api-docs
   - CRUD de usuarios
   - Búsqueda y filtrado
   - Paginación

3. **ms-project-manager**: http://localhost:3002/api-docs
   - Gestión de proyectos
   - Gestión de tareas
   - Documentación completa con ejemplos

4. **BFF**: http://localhost:3010/api-docs
   - Endpoints agregados para frontend
   - Orquestación entre servicios
   - Rutas públicas y protegidas

### Cómo Probar los Endpoints con Swagger

#### 1. Obtener Token JWT (Login)

1. Ir a http://localhost:3001/api-docs
2. Expandir `POST /api/auth/login`
3. Click en "Try it out"
4. Ingresar credenciales:
   ```json
   {
     "email": "usuario@ejemplo.com",
     "password": "tu_password"
   }
   ```
5. Click "Execute"
6. **Copiar el token** de la respuesta

#### 2. Usar el Token en Requests Protegidos

1. Click en el botón **"Authorize" ** (arriba a la derecha en Swagger UI)
2. Ingresar: `Bearer tu_token_jwt_aqui`
3. Click "Authorize"
4. Ahora puedes usar todos los endpoints protegidos

#### 3. Probar Endpoints con Parámetros

Ejemplo: Obtener proyecto por ID
1. Expandir `GET /api/v1/projects/{id}`
2. Click "Try it out"
3. Ingresar un ID válido (ej: `123`)
4. Click "Execute"
5. Ver la respuesta

---

##  Solución de Problemas Comunes

### Problema: "Puerto ya en uso" (EADDRINUSE)

**Síntoma:** 
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solución:**
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3001

# Matar el proceso (reemplazar PID con el número que aparece)
Stop-Process -Id <PID> -Force
```

**O matar todos los procesos Node:**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Problema: BFF no responde (timeout)

**Posibles causas:**
1. Puerto 3010 ocupado por otro proceso
2. Caché de ts-node-dev inconsistente

**Solución:**
```powershell
# Matar proceso en puerto 3010
$pid = (netstat -ano | findstr :3010 | Select-String -Pattern '\d+$').Matches.Value
if($pid) { Stop-Process -Id $pid -Force }

# Limpiar caché y reiniciar
cd backend\bff
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
npm run dev
```

### Problema: Swagger muestra endpoints vacíos

**Causa:** Falta documentación OpenAPI en el código.

**Verificación:**
- Revisar que los archivos de rutas tengan comentarios `@openapi`
- Verificar que `apis` en swaggerJsdoc apunte a los archivos correctos

### Problema: Error de base de datos

**Síntoma:**
```
Connection timeout or database not accessible
```

**Solución:**
1. Verificar que la URL de conexión en `.env.docker` sea correcta
2. Verificar que la base de datos esté accesible:
   ```powershell
   # Para Neon Cloud, debe ser accesible desde internet
   # Para PostgreSQL local, debe estar corriendo:
   pg_isready -h localhost -p 5432
   ```

### Problema: JWT inválido o expirado

**Causa:** Token expirado o claves RSA no sincronizadas.

**Solución:**
1. Hacer login nuevamente para obtener un token fresco
2. Verificar que todos los servicios tengan la misma `public.key`:
   ```powershell
   # Comparar checksums
   Get-FileHash backend\ms-auth\keys\public.key
   Get-FileHash backend\ms-users\keys\public.key
   Get-FileHash backend\ms-project-manager\keys\public.key
   Get-FileHash backend\bff\keys\public.key
   ```
3. Si son diferentes, copiar la clave pública de ms-auth a los otros servicios:
   ```powershell
   Copy-Item backend\ms-auth\keys\public.key backend\ms-users\keys\
   Copy-Item backend\ms-auth\keys\public.key backend\ms-project-manager\keys\
   Copy-Item backend\ms-auth\keys\public.key backend\bff\keys\
   ```

---

##  Arquitectura del Sistema

```
┌─────────────┐
│  Frontend   │
│ (React/Vue) │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│          API Gateway (BFF)          │
│         Port: 3010                  │
│  • Orquestación de servicios        │
│  • Transformación de respuestas     │
│  • Agregación de datos              │
└──────┬──────────────────────────────┘
       │
       ├─────────────┬──────────────────┬──────────────────┐
       ▼             ▼                  ▼                  ▼
┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐ ┌────────────┐
│  ms-auth    │ │  ms-users    │ │ ms-project-manager  │ │ KrakenD    │
│  Port: 3001 │ │  Port: 3003  │ │    Port: 3002       │ │ (Opcional) │
│             │ │              │ │                     │ └────────────┘
│ • Login     │ │ • CRUD Users │ │ • Projects          │
│ • Logout    │ │ • Roles      │ │ • Tasks             │
│ • JWT Sign  │ │ • Search     │ │ • Assignments       │
│ • Roles     │ │              │ │                     │
└─────┬───────┘ └──────┬───────┘ └──────────┬──────────┘
      │                │                     │
      │                │                     │
      ▼                ▼                     ▼
┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐
│ PostgreSQL  │ │ PostgreSQL   │ │   PostgreSQL        │
│ (Auth DB)   │ │ (Users DB)   │ │   (Projects DB)     │
│             │ │              │ │                     │
│ • usuarios  │ │ • usuarios   │ │ • projects          │
│ • roles     │ │ • perfiles   │ │ • tasks             │
│ • blacklist │ │              │ │ • assignments       │
└─────────────┘ └──────────────┘ └─────────────────────┘
```

**⚠️ IMPORTANTE: Patrón Database per Service**

Cada microservicio tiene su **propia base de datos independiente**:
- ✅ Mayor independencia y escalabilidad
- ✅ Cada servicio puede evolucionar su esquema sin afectar otros
- ✅ Fallos aislados (una BD caída no afecta otros servicios)

Ver documentación completa: [backend/docs/DATABASE-PER-SERVICE.md](backend/docs/DATABASE-PER-SERVICE.md)

### Flujo de Autenticación

1. **Usuario hace login** → `POST /api/v1/login` (BFF)
2. **BFF reenvía** → `POST /api/auth/login` (ms-auth)
3. **ms-auth valida** credenciales en su base de datos
4. **ms-auth firma JWT** con clave privada RSA
5. **ms-auth retorna** token al BFF
6. **BFF retorna** token al frontend
7. **Frontend incluye** token en header `Authorization: Bearer <token>`
8. **Cada servicio verifica** el token con clave pública RSA

### Patrón Database per Service

Cada microservicio tiene su **propia base de datos independiente**:

- **ms-auth**: Base de datos exclusiva para autenticación
  - Tabla `usuarios` (credenciales, passwords hash)
  - Tabla `roles` (catálogo de roles)
  - Tabla `token_blacklist` (tokens revocados)

- **ms-users**: Base de datos exclusiva para perfiles de usuario
  - Tabla `usuarios` (información de perfil completa)
  - Puede tener más tablas de perfil en el futuro

- **ms-project-manager**: Base de datos exclusiva para proyectos
  - Tabla `projects` (proyectos)
  - Tabla `tasks` (tareas)
  - Tabla `assignments` (asignaciones)

**Ventajas:**
- ✅ Independencia: cada servicio evoluciona sin afectar otros
- ✅ Escalabilidad: cada BD puede escalarse por separado
- ✅ Resiliencia: fallos aislados por servicio

**Configuración en `.env.docker`:**
```env
DATABASE_URL_AUTH=postgresql://...      # BD exclusiva de ms-auth
DATABASE_URL_USERS=postgresql://...     # BD exclusiva de ms-users (DIFERENTE)
DATABASE_URL_PM=postgresql://...        # BD exclusiva de ms-project-manager
```

**📚 Ver más:** [backend/docs/DATABASE-PER-SERVICE.md](backend/docs/DATABASE-PER-SERVICE.md)

---

## 📝 Notas Adicionales

### Swagger Features Implementadas

✅ **Request Body Schemas**: Todos los POST/PUT tienen ejemplos de JSON  
✅ **Path Parameters**: Documentados con tipo y ejemplos  
✅ **Query Parameters**: Paginación y filtros documentados  
✅ **Response Examples**: Respuestas 200, 400, 401, 403, 404, 500  
✅ **Security Schemes**: Bearer JWT configurado  
✅ **Tags**: Endpoints agrupados por funcionalidad  

### Tecnologías Utilizadas

- **Node.js** v24.16.0
- **TypeScript** v6.0.3
- **Express** v4.21.2
- **swagger-jsdoc** v6.2.8
- **swagger-ui-express** v5.0.1
- **ts-node-dev** v2.0.0 (desarrollo)
- **PostgreSQL** (Neon Cloud)
- **JWT** RS256 con RSA keys

### Scripts Disponibles

Cada microservicio tiene los siguientes scripts en `package.json`:

```json
{
  "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
  "build": "tsc",
  "start": "node dist/app.js",
  "test": "jest"
}
```

### Estructura de Directorios

```
backend/
├── api-gateway/          # KrakenD config (opcional)
├── bff/                  # Backend For Frontend
├── ms-auth/              # Microservicio de autenticación
├── ms-users/             # Microservicio de usuarios
├── ms-project-manager/   # Microservicio de proyectos/tareas
├── docker-compose.yml    # Orquestación de servicios
└── .env.docker          # Variables de entorno
```

---

## 🎓 Recursos de Aprendizaje

- **Swagger/OpenAPI**: https://swagger.io/docs/
- **Express.js**: https://expressjs.com/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **JWT**: https://jwt.io/introduction
- **Microservicios**: https://microservices.io/

---

## 🤝 Soporte

Si encuentras algún problema:

1. Revisa la sección de Solución de Problemas
2. Verifica los logs de cada servicio
3. Asegúrate de que las dependencias estén instaladas
4. Verifica que los puertos no estén ocupados
5. Revisa que las claves RSA estén sincronizadas

---

**¡Sistema completamente funcional con Swagger en todos los microservicios! 🎉**
