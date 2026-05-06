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
- POST `/register` - Registro de usuarios (en desarrollo)
- POST `/login` - Inicio de sesión (en desarrollo)
- GET `/health` - Health check

**Iniciar servicio:**
```bash
cd auth
npm install
npm run dev
```

## Tareas completadas
- ✅ AS-TASK-01: Estructura base del microservicio Auth