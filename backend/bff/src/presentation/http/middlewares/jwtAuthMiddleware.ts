export {};

/**
 * BFF-TASK-06: Middleware de autenticación simplificado
 * 
 * ARQUITECTURA CON KRAKEND:
 * - KrakenD ya validó el JWT con la clave pública RSA
 * - KrakenD inyecta headers X-User-Id, X-User-Email, X-User-Role
 * - Este middleware solo lee esos headers (confía en el gateway)
 * 
 * SEGURIDAD:
 * - Este middleware SOLO debe usarse detrás de KrakenD
 * - Nunca exponer el BFF directamente al público
 * - KrakenD es la única fuente de verdad para autenticación
 */
function jwtAuthMiddleware(req, res, next) {
  // Leer headers que KrakenD ya validó
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];

  // Verificar que los headers existan (protección básica)
  if (!userId || !userEmail || !userRole) {
    console.warn('[BFF-JWT-MIDDLEWARE] ⚠️  Headers de usuario no encontrados - ¿BFF expuesto directamente?');
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication headers missing. This service must be accessed through the API Gateway.'
    });
  }

  // Poblar req.user con los datos validados por KrakenD
  req.user = {
    id: parseInt(userId as string, 10),
    email: userEmail as string,
    role: userRole as string
  };
  
  console.log(`[BFF-JWT-MIDDLEWARE] ✅ Usuario autenticado por KrakenD - UserID: ${req.user.id} - Role: ${req.user.role}`);
  next();
}

module.exports = jwtAuthMiddleware;
