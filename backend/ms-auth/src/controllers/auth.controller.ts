// @ts-nocheck
export {};
// AS-TASK-02: Controlador de autenticación y autorización
// Endpoints para integración con API Gateway

// AS-TASK-04: Importar servicio de usuario (mantenido para verificación de password)
const userService = require('../services/user.service');

// Cliente para comunicación con ms-users
const usersClient = require('../clients/usersClient');

// AS-TASK-06: Importar JWT Helper para validación y generación de tokens
const jwtHelper = require('../utils/jwt.helper');

// AS-TASK-07: Importar servicio de blacklist de tokens
const tokenBlacklistService = require('../services/token.blacklist.service');

// AS-TASK-08: Importar configuración de roles
const { getAllRolesInfo, getRoleDescription } = require('../config/roles');

// AS-TASK-13: Importar logger con Winston para auditoría
const logger = require('../utils/logger');

// AS-TASK-14: Importar funciones de métricas de Prometheus
const { recordCriticalOperation } = require('../middleware/metricsMiddleware');

// DTO: Importar Data Transfer Objects para validación y formateo
const {
  createRegisterDto,
  createLoginDto,
  userToDto,
  authResponseDto,
  registerResponseDto,
  errorResponseDto,
  validateUserData
} = require('../dtos/userDto');

/**
 * ============================================================
 * FUNCIÓN DEPRECADA - MOVIDA A MS-USERS
 * ============================================================
 * POST /register - Registro de usuarios
 * AHORA EN: ms-users → POST /api/users
 * 
 * Esta función se mantiene comentada por referencia histórica.
 * NO debe usarse en ms-auth.
 */
/*
const register = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // DTO: Limpiar y formatear datos de entrada
    const userData = createRegisterDto(req.body);
    
    // AS-TASK-08: Asignar rol por defecto si no se especifica
    if (!userData.rol) {
      userData.rol = userService.getDefaultRole();
      console.log(`[AUTH-AUDIT] Rol no especificado, asignando rol por defecto: ${userData.rol}`);
    }
    
    // Log de auditoría: Inicio de solicitud
    console.log(`[AUTH-AUDIT] Solicitud de registro recibida - Email: ${userData.email || 'N/A'} - Rol: ${userData.rol} - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);

    // 1. Validar campos obligatorios
    if (!userData.nombre || !userData.email || !userData.password) {
      console.warn(`[AUTH-AUDIT] Registro fallido - Campos faltantes - Email: ${userData.email || 'N/A'}`);
      return res.status(400).json(
        errorResponseDto('Campos obligatorios faltantes: nombre, email, password')
      );
    }

    // 2. DTO: Validar formato y estructura de datos
    const validation = validateUserData(userData);
    if (!validation.valid) {
      console.warn(`[AUTH-AUDIT] Registro fallido - Validación de datos - Email: ${userData.email} - Errores: ${validation.errors.join(', ')}`);
      return res.status(400).json(
        errorResponseDto('Datos de usuario inválidos', { errors: validation.errors })
      );
    }

    // 3. Verificar si el email ya existe (evitar duplicados)
    const emailExists = await userService.emailExists(userData.email);
    if (emailExists) {
      console.warn(`[AUTH-AUDIT] Registro fallido - Email duplicado - Email: ${userData.email}`);
      return res.status(400).json(
        errorResponseDto('El email ya está registrado en el sistema')
      );
    }

    // 4. Crear usuario (bcrypt cifrado + INSERT en PostgreSQL)
    const newUser = await userService.createUser(userData);
    
    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime;

    // AS-TASK-13: Log de auditoría con Winston
    logger.logCriticalOperation('REGISTER', {
      success: true,
      userId: newUser.id,
      email: newUser.email,
      ip: req.ip,
      detail: `Usuario registrado - Rol: ${newUser.rol}`,
      responseTime,
      taskId: 'AS-TASK-13'
    });

    // AS-TASK-14: Registrar operación en métricas de Prometheus
    recordCriticalOperation('REGISTER', true);

    // 5. DTO: Responder con formato estándar (sin password)
    res.status(201).json(registerResponseDto(newUser));

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // AS-TASK-13: Log de auditoría con Winston
    logger.logCriticalOperation('REGISTER', {
      success: false,
      userId: null,
      email: req.body.email || 'N/A',
      ip: req.ip,
      detail: 'Error en registro',
      error: error.message,
      responseTime,
      taskId: 'AS-TASK-13'
    });

    // AS-TASK-14: Registrar operación fallida en métricas
    recordCriticalOperation('REGISTER', false);
    
    // Manejo de errores de BD específicos
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(400).json(
        errorResponseDto('El email ya está registrado')
      );
    }

    // Error genérico del servidor
    res.status(500).json(
      errorResponseDto('Error interno del servidor al registrar usuario', { error: error.message })
    );
  }
};
*/

/**
 * POST /login - Inicio de sesión
 * AS-TASK-06: Validación de credenciales y generación de JWT con helper
 * DTO: Usa DTOs para validación y formateo de respuestas
 */
const login = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // DTO: Limpiar y formatear credenciales
    const credentials = createLoginDto(req.body);
    const { email, password } = credentials;
    
    // Log de auditoría: Inicio de solicitud
    console.log(`[AUTH-AUDIT] Intento de login - Email: ${email || 'N/A'} - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);

    // 1. Validar campos obligatorios
    if (!email || !password) {
      console.warn(`[AUTH-AUDIT] Login fallido - Campos faltantes - Email: ${email || 'N/A'}`);
      return res.status(400).json(
        errorResponseDto('Email y contraseña son requeridos')
      );
    }

    // 2. Validar formato de email (AS-TASK-06: Mejora de validación)
    if (!jwtHelper.validateEmail(email)) {
      console.warn(`[AUTH-AUDIT] Login fallido - Email inválido - Email: ${email}`);
      return res.status(400).json(
        errorResponseDto('Formato de email inválido')
      );
    }

    // 3. Buscar usuario por email en la base de datos local
    const user = await userService.findByEmail(email);
    
    if (!user) {
      // Log de auditoría: Usuario no encontrado
      console.warn(`[AUTH-AUDIT] Login fallido - Usuario no encontrado - Email: ${email}`);
      return res.status(401).json(
        errorResponseDto('Credenciales inválidas')
      );
    }

    // 4. Verificar contraseña con bcrypt.compare
    const isPasswordValid = await userService.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      // Log de auditoría: Contraseña incorrecta
      console.warn(`[AUTH-AUDIT] Login fallido - Contraseña incorrecta - Email: ${email} - UserID: ${user.id}`);
      return res.status(401).json(
        errorResponseDto('Credenciales inválidas')
      );
    }

    // 5. Generar token JWT usando helper (AS-TASK-06: SOLID - Separación de responsabilidades)
    const token = jwtHelper.generateToken({
      id: user.id,
      email: user.email,
      rol: user.rol
    });

    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime;

    // Obtener configuración JWT para logs
    const jwtConfig = jwtHelper.getConfig();

    // AS-TASK-13: Log de auditoría con Winston
    logger.logCriticalOperation('LOGIN', {
      success: true,
      userId: user.id,
      email: user.email,
      ip: req.ip,
      detail: `Login exitoso - Rol: ${user.rol} - Expira: ${jwtConfig.expiresIn}`,
      responseTime,
      taskId: 'AS-TASK-13'
    });

    // AS-TASK-14: Registrar operación en métricas de Prometheus
    recordCriticalOperation('LOGIN', true);

    // 6. DTO: Responder con formato estándar (sin password)
    res.status(200).json(authResponseDto(user, token));

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // AS-TASK-13: Log de auditoría con Winston
    logger.logCriticalOperation('LOGIN', {
      success: false,
      userId: null,
      email: req.body.email || 'N/A',
      ip: req.ip,
      detail: 'Error en login',
      error: error.message,
      responseTime,
      taskId: 'AS-TASK-13'
    });

    // AS-TASK-14: Registrar operación fallida en métricas
    recordCriticalOperation('LOGIN', false);
    
    // Error genérico del servidor
    res.status(500).json(
      errorResponseDto('Error interno del servidor al iniciar sesión', { error: error.message })
    );
  }
};

/**
 * POST /logout - Invalidar sesi�n (revocar token JWT)
 * AS-TASK-07: Implementaci�n completa con blacklist de tokens
 */
const logout = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // El token ya viene extra�do y validado por el middleware verifyToken
    const token = req.token;
    const user = req.user; // { id, email, rol }

    // Log de auditor�a: Inicio de logout
    console.log(`[AUTH-AUDIT] Solicitud de logout - UserID: ${user.id} - Email: ${user.email} - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);

    // Agregar token a blacklist
    const blacklisted = tokenBlacklistService.addToBlacklist(token, {
      id: user.id,
      email: user.email,
      rol: user.rol
    });

    if (!blacklisted) {
      console.error(`[AUTH-AUDIT] [ERROR] Error al invalidar token - UserID: ${user.id} - Email: ${user.email}`);
      return res.status(500).json({
        success: false,
        message: 'Error al cerrar sesi�n',
        taskId: 'AS-TASK-07',
        data: null
      });
    }

    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime;

    // AS-TASK-13: Log de auditor�a con Winston
    logger.logCriticalOperation('LOGOUT', {
      success: true,
      userId: user.id,
      email: user.email,
      ip: req.ip,
      detail: 'Logout exitoso - Token invalidado',
      responseTime,
      taskId: 'AS-TASK-13'
    });

    // AS-TASK-14: Registrar operaci�n en m�tricas de Prometheus
    recordCriticalOperation('LOGOUT', true);

    // Responder con �xito
    res.status(200).json({
      success: true,
      message: 'Sesi�n cerrada exitosamente. Token invalidado.',
      taskId: 'AS-TASK-13',
      data: {
        userId: user.id,
        email: user.email,
        logoutAt: new Date().toISOString()
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // AS-TASK-13: Log de auditor�a con Winston
    logger.logCriticalOperation('LOGOUT', {
      success: false,
      userId: req.user?.id || null,
      email: req.user?.email || 'N/A',
      ip: req.ip,
      detail: 'Error en logout',
      error: error.message,
      responseTime,
      taskId: 'AS-TASK-13'
    });

    // AS-TASK-14: Registrar operaci�n fallida en m�tricas
    recordCriticalOperation('LOGOUT', false);
    
    // Error gen�rico del servidor
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al cerrar sesi�n',
      taskId: 'AS-TASK-07',
      data: { error: error.message }
    });
  }
};

/**
 * GET /roles - Listar roles disponibles
 */
/**
 * GET /roles - Listar roles disponibles
 * AS-TASK-08: Usar roles definidos en config
 */
const getRoles = async (req, res) => {
  try {
    // AS-TASK-08: Obtener roles desde configuraci�n
    const rolesInfo = getAllRolesInfo();
    
    // Formatear respuesta con �ndice
    const roles = rolesInfo.map((role, index) => ({
      id: index + 1,
      nombre: role.nombre,
      descripcion: role.descripcion,
      permisos: role.permisos
    }));

    res.status(200).json({
      success: true,
      message: 'Roles obtenidos exitosamente',
      taskId: 'AS-TASK-08',
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener roles',
      error: error.message,
      taskId: 'AS-TASK-02'
    });
  }
};

/**
 * GET /roles/simple - Listar solo nombres de roles (formato simplificado)
 * AS-TASK-10: Endpoint simplificado que retorna solo array de nombres
 */
const getRolesSimple = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Log de auditor�a: Inicio de consulta
    console.log(`[AUTH-AUDIT] Consulta de roles simplificados - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);
    
    // Obtener roles desde configuraci�n
    const rolesArray = getAllRoles();
    
    const responseTime = Date.now() - startTime;
    
    // Log de auditor�a: Consulta exitosa
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
    
    // Log de auditor�a: Error
    console.error(`[AUTH-AUDIT] [ERROR] Error al obtener roles simplificados - Error: ${error.message} - Tiempo: ${responseTime}ms - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);
    
    res.status(500).json({
      success: false,
      message: 'Error al obtener roles',
      error: error.message,
      taskId: 'AS-TASK-10'
    });
  }
};

/**
 * ============================================================
 * FUNCIONES DEPRECADAS - MOVIDAS A MS-USERS
 * ============================================================
 * Las siguientes funciones updateUserRole y getUserById fueron
 * movidas a ms-users y se comentan por referencia histórica.
 * NO deben usarse en ms-auth.
 */

/*
// DEPRECADO: Movido a ms-users → PUT /api/users/:id/role
const updateUserRole = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const { rol } = req.body;

    // Log de auditor�a: Inicio de solicitud
    console.log(`[AUTH-AUDIT] Solicitud de actualizaci�n de rol - UserID: ${id} - Nuevo rol: ${rol || 'N/A'} - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);

    // 1. Validar campo rol
    if (!rol) {
      console.warn(`[AUTH-AUDIT] Actualizaci�n fallida - Campo rol faltante - UserID: ${id}`);
      return res.status(400).json({
        success: false,
        message: 'El campo rol es requerido',
        taskId: 'AS-TASK-11',
        data: null
      });
    }

    // 2. Validar que el ID sea un n�mero
    const userId = parseInt(id);
    if (isNaN(userId)) {
      console.warn(`[AUTH-AUDIT] Actualizaci�n fallida - ID inv�lido - ID: ${id}`);
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inv�lido',
        taskId: 'AS-TASK-11',
        data: null
      });
    }

    // 3. Obtener usuario actual para logs
    const currentUser = await userService.findById(userId);
    if (!currentUser) {
      console.warn(`[AUTH-AUDIT] Actualizaci�n fallida - Usuario no encontrado - UserID: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        taskId: 'AS-TASK-11',
        data: null
      });
    }

    const oldRole = currentUser.rol;

    // 4. Actualizar rol usando UserService
    const updatedUser = await userService.updateUserRole(userId, rol);
    
    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime;

    // AS-TASK-13: Log de auditor�a con Winston
    logger.logCriticalOperation('ROLE_CHANGE', {
      success: true,
      userId: userId,
      email: updatedUser.email,
      ip: req.ip,
      detail: `Rol actualizado - Anterior: ${oldRole} - Nuevo: ${updatedUser.rol}`,
      responseTime,
      taskId: 'AS-TASK-13'
    });

    // AS-TASK-14: Registrar operaci�n en m�tricas de Prometheus
    recordCriticalOperation('ROLE_CHANGE', true);

    // 5. Responder con �xito
    res.status(200).json({
      success: true,
      message: `Rol actualizado exitosamente de "${oldRole}" a "${rol}"`,
      taskId: 'AS-TASK-13',
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
    const responseTime = Date.now() - startTime;
    
    // AS-TASK-13: Log de auditor�a con Winston
    logger.logCriticalOperation('ROLE_CHANGE', {
      success: false,
      userId: req.params.id || null,
      email: 'N/A',
      ip: req.ip,
      detail: 'Error al actualizar rol',
      error: error.message,
      responseTime,
      taskId: 'AS-TASK-13'
    });

    // AS-TASK-14: Registrar operaci�n fallida en m�tricas
    recordCriticalOperation('ROLE_CHANGE', false);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar rol',
      error: error.message,
      taskId: 'AS-TASK-13'
    });
  }
};
*/

/**
 * ============================================================
 * FUNCIÓN DEPRECADA - MOVIDA A MS-USERS
 * ============================================================
 * GET /usuarios/:id - Perfil público de usuario
 * AHORA EN: ms-users → GET /api/users/:id
 * 
 * Esta función se mantiene comentada por referencia histórica.
 * NO debe usarse en ms-auth.
 */
/*
const getUserById = async (req, res) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        taskId: 'BFF-AUTH-USER',
        data: null
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Usuario obtenido',
      taskId: 'BFF-AUTH-USER',
      data: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message,
      taskId: 'BFF-AUTH-USER'
    });
  }
};
*/

/**
 * GET /health - Health check para monitoreo
 */
const health = async (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    service: 'Auth Microservice',
    taskId: 'AS-TASK-02',
    timestamp: new Date().toISOString()
  });
};

// NOTA: Las siguientes funciones fueron MOVIDAS a ms-users:
// - register → ms-users: POST /api/users
// - getUserById → ms-users: GET /api/users/:id
// - updateUserRole → ms-users: PUT /api/users/:id/role
// El código original se mantiene comentado al final del archivo por referencia histórica

module.exports = {
  login,
  logout,
  getRoles,
  getRolesSimple,
  health
};

/* ============================================================
 * FUNCIONES DEPRECADAS - MOVIDAS A MS-USERS
 * ============================================================
 * Las siguientes funciones ya NO deben usarse en ms-auth.
 * Se mantienen comentadas solo como referencia histórica.
 * 
 * Para gestión de usuarios, usar ms-users:
 * - POST /api/users (crear usuario)
 * - GET /api/users/:id (obtener usuario)
 * - PUT /api/users/:id/role (cambiar rol)
 * ============================================================
 */

/*
// DEPRECADO: Movido a ms-users
const register = async (req, res) => {
  // Esta función ya no debe usarse
  // Usar POST /api/users en ms-users
  return res.status(410).json({
    success: false,
    error: 'Este endpoint ha sido movido a ms-users',
    redirect: 'POST /api/users'
  });
};

// DEPRECADO: Movido a ms-users
const getUserById = async (req, res) => {
  // Esta función ya no debe usarse
  // Usar GET /api/users/:id en ms-users
  return res.status(410).json({
    success: false,
    error: 'Este endpoint ha sido movido a ms-users',
    redirect: 'GET /api/users/:id'
  });
};

// DEPRECADO: Movido a ms-users
const updateUserRole = async (req, res) => {
  // Esta función ya no debe usarse
  // Usar PUT /api/users/:id/role en ms-users
  return res.status(410).json({
    success: false,
    error: 'Este endpoint ha sido movido a ms-users',
    redirect: 'PUT /api/users/:id/role'
  });
};
*/


