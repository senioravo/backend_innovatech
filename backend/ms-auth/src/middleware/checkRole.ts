// AS-TASK-09: Middleware de autorizaci�n por rol
// Responsabilidad: Verificar que el usuario tenga el rol adecuado para acceder a un endpoint
// Principio SOLID: Single Responsibility - Solo valida autorizaci�n por rol

import jwt from 'jsonwebtoken';
import { asAuthPayload } from '../types/authJwtPayload.js';
import { ROLES, hasPermission } from '../config/roles.js';

/**
 * Middleware de autorizaci�n por rol
 * Extrae el token JWT, lo verifica y valida permisos del rol
 * 
 * @param {string} moduloRequerido - M�dulo del sistema (proyectos, tareas, reportes)
 * @param {string} accionRequerida - Acci�n requerida (crear, editar, ver, etc.)
 * @returns {Function} - Middleware function
 */
const checkRole = (moduloRequerido, accionRequerida) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    try {
      // 1. Extraer token del header Authorization
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        console.warn(`[AUTHORIZATION-AUDIT] Acceso denegado - No hay token - IP: ${req.ip} - Endpoint: ${req.method} ${req.path} - Timestamp: ${new Date().toISOString()}`);
        
        return res.status(401).json({
          success: false,
          message: 'Token no proporcionado. Debe incluir header Authorization: Bearer <token>',
          taskId: 'AS-TASK-09',
          data: {}
        });
      }

      // 2. Verificar formato "Bearer <token>"
      const parts = authHeader.split(' ');
      
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        console.warn(`[AUTHORIZATION-AUDIT] Acceso denegado - Formato de token inv�lido - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);
        
        return res.status(401).json({
          success: false,
          message: 'Formato de token inv�lido. Use: Authorization: Bearer <token>',
          taskId: 'AS-TASK-09',
          data: {}
        });
      }

      const token = parts[1];

      // 3. Verificar token JWT con clave secreta del .env
      const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_default_CHANGE_THIS';
      
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        console.warn(`[AUTHORIZATION-AUDIT] Acceso denegado - Token inv�lido/expirado - Error: ${error.message} - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);
        
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token expirado. Por favor inicie sesi�n nuevamente',
            taskId: 'AS-TASK-09',
            data: {}
          });
        }
        
        return res.status(401).json({
          success: false,
          message: 'Token inv�lido',
          taskId: 'AS-TASK-09',
          data: {}
        });
      }

      // 4. Extraer rol del payload del JWT
      const userRole = decoded.rol;
      const userId = decoded.id;
      const userEmail = decoded.email;

      if (!userRole) {
        console.error(`[AUTHORIZATION-AUDIT] Acceso denegado - Rol no encontrado en token - UserID: ${userId} - Email: ${userEmail} - Timestamp: ${new Date().toISOString()}`);
        
        return res.status(403).json({
          success: false,
          message: 'Rol de usuario no encontrado en el token',
          taskId: 'AS-TASK-09',
          data: {}
        });
      }

      // 5. Validar permisos del rol para el m�dulo y acci�n requeridos
      const tienePermiso = hasPermission(userRole, moduloRequerido, accionRequerida);

      if (!tienePermiso) {
        const responseTime = Date.now() - startTime;
        
        // Log de auditor�a: Acceso bloqueado por falta de permisos
        console.warn(`[AUTHORIZATION-AUDIT] [ERROR] Acceso BLOQUEADO - UserID: ${userId} - Email: ${userEmail} - Rol: ${userRole} - M�dulo: ${moduloRequerido} - Acci�n: ${accionRequerida} - Endpoint: ${req.method} ${req.path} - IP: ${req.ip} - Tiempo: ${responseTime}ms - Timestamp: ${new Date().toISOString()}`);
        
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Su rol "${userRole}" no tiene permiso para "${accionRequerida}" en el m�dulo "${moduloRequerido}"`,
          taskId: 'AS-TASK-09',
          data: {
            rolActual: userRole,
            moduloRequerido: moduloRequerido,
            accionRequerida: accionRequerida,
            permisosNecesarios: getRequiredRolesForAction(moduloRequerido, accionRequerida)
          }
        });
      }

      // 6. Permiso concedido - Agregar informaci�n del usuario al request
      req.user = {
        id: userId,
        email: userEmail,
        rol: userRole
      };
      req.token = token;

      const responseTime = Date.now() - startTime;
      
      // Log de auditor�a: Acceso autorizado
      console.log(`[AUTHORIZATION-AUDIT] [OK] Acceso AUTORIZADO - UserID: ${userId} - Email: ${userEmail} - Rol: ${userRole} - M�dulo: ${moduloRequerido} - Acci�n: ${accionRequerida} - Endpoint: ${req.method} ${req.path} - Tiempo: ${responseTime}ms - Timestamp: ${new Date().toISOString()}`);

      next();
    } catch (error) {
      console.error(`[AUTHORIZATION-AUDIT] [ERROR] Error en middleware de autorizaci�n - Error: ${error.message} - Endpoint: ${req.method} ${req.path} - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);
      
      return res.status(500).json({
        success: false,
        message: 'Error interno al verificar permisos',
        taskId: 'AS-TASK-09',
        data: { error: error.message }
      });
    }
  };
};

/**
 * Obtener roles que tienen permiso para una acci�n en un m�dulo
 * @param {string} modulo - M�dulo del sistema
 * @param {string} accion - Acci�n requerida
 * @returns {Array<string>} - Array de roles con permiso
 */
const getRequiredRolesForAction = (modulo, accion) => {
  const rolesConPermiso = [];
  
  Object.values(ROLES).forEach(rol => {
    if (hasPermission(rol, modulo, accion)) {
      rolesConPermiso.push(rol);
    }
  });
  
  return rolesConPermiso;
};

/**
 * Middleware espec�fico: Solo GESTOR puede crear/editar proyectos
 * Uso: router.post('/proyectos', checkRoleGestor, createProject)
 */
const checkRoleGestor = checkRole('proyectos', 'crear');

/**
 * Middleware espec�fico: Solo PROFESIONAL puede actualizar tareas
 * Uso: router.put('/tareas/:id', checkRoleProfesional, updateTask)
 */
const checkRoleProfesional = checkRole('tareas', 'actualizar');

/**
 * Middleware espec�fico: Solo DIRECTIVO puede consultar KPIs
 * Uso: router.get('/reportes/kpis', checkRoleDirectivo, getKPIs)
 */
const checkRoleDirectivo = checkRole('reportes', 'kpis');

/**
 * Middleware para verificar solo autenticaci�n (sin validar permisos espec�ficos)
 * Extrae token y valida, pero no verifica permisos de m�dulo/acci�n
 * @returns {Function} - Middleware function
 */
const checkAuthentication = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token no proporcionado',
          taskId: 'AS-TASK-09',
          data: {}
        });
      }

      const token = authHeader.split(' ')[1];
      const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_default_CHANGE_THIS';
      
      const decoded = asAuthPayload(jwt.verify(token, JWT_SECRET));
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        rol: decoded.rol
      };
      req.token = token;

      console.log(`[AUTHORIZATION-AUDIT] Usuario autenticado - UserID: ${decoded.id} - Email: ${decoded.email} - Rol: ${decoded.rol}`);

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inv�lido',
        taskId: 'AS-TASK-09',
        data: {}
      });
    }
  };
};

export { checkRole, checkRoleGestor, checkRoleProfesional, checkRoleDirectivo, checkAuthentication, getRequiredRolesForAction };