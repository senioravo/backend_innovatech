// AS-TASK-02: Controlador de autenticación y autorización
// Endpoints para integración con API Gateway

// AS-TASK-04: Importar servicio de usuario
const userService = require('../services/user.service');

// AS-TASK-06: Importar JWT Helper para validación y generación de tokens
const jwtHelper = require('../utils/jwt.helper');

// AS-TASK-07: Importar servicio de blacklist de tokens
const tokenBlacklistService = require('../services/token.blacklist.service');

/**
 * POST /register - Registro de usuarios
 * AS-TASK-04: Implementación completa con PostgreSQL y bcrypt
 */
const register = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { nombre, email, password, rol } = req.body;
    
    // Log de auditoría: Inicio de solicitud
    console.log(`[AUTH-AUDIT] Solicitud de registro recibida - Email: ${email || 'N/A'} - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);

    // 1. Validar campos obligatorios
    if (!nombre || !email || !password || !rol) {
      console.warn(`[AUTH-AUDIT] Registro fallido - Campos faltantes - Email: ${email || 'N/A'}`);
      return res.status(400).json({
        success: false,
        message: 'Campos obligatorios faltantes: nombre, email, password, rol',
        taskId: 'AS-TASK-04',
        data: null
      });
    }

    // 2. Validar formato y estructura de datos (SOLID: Delegación a UserService)
    const validation = userService.validateUserData({ nombre, email, password, rol });
    if (!validation.valid) {
      console.warn(`[AUTH-AUDIT] Registro fallido - Validación de datos - Email: ${email} - Errores: ${validation.errors.join(', ')}`);
      return res.status(400).json({
        success: false,
        message: 'Datos de usuario inválidos',
        taskId: 'AS-TASK-04',
        data: { errors: validation.errors }
      });
    }

    // 3. Verificar si el email ya existe (evitar duplicados)
    const emailExists = await userService.emailExists(email);
    if (emailExists) {
      console.warn(`[AUTH-AUDIT] Registro fallido - Email duplicado - Email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado en el sistema',
        taskId: 'AS-TASK-04',
        data: null
      });
    }

    // 4. Crear usuario (bcrypt cifrado + INSERT en PostgreSQL)
    const newUser = await userService.createUser({ nombre, email, password, rol });
    
    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime;

    // Log de auditoría: Registro exitoso
    console.log(`[AUTH-AUDIT] ✓ Usuario registrado exitosamente - ID: ${newUser.id} - Email: ${newUser.email} - Rol: ${newUser.rol} - Tiempo: ${responseTime}ms - Timestamp: ${new Date().toISOString()}`);

    // 5. Responder con éxito (201 Created)
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      taskId: 'AS-TASK-04',
      data: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        createdAt: newUser.created_at
      }
    });

  } catch (error) {
    // Log de auditoría: Error del servidor
    console.error(`[AUTH-AUDIT] ✗ Error en registro - Email: ${req.body.email || 'N/A'} - Error: ${error.message} - Timestamp: ${new Date().toISOString()}`);
    
    // Manejo de errores de BD específicos
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
        taskId: 'AS-TASK-04',
        data: null
      });
    }

    // Error genérico del servidor
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al registrar usuario',
      taskId: 'AS-TASK-04',
      data: { error: error.message }
    });
  }
};

/**
 * POST /login - Inicio de sesión
 * AS-TASK-06: Validación de credenciales y generación de JWT con helper
 */
const login = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email, password } = req.body;
    
    // Log de auditoría: Inicio de solicitud
    console.log(`[AUTH-AUDIT] Intento de login - Email: ${email || 'N/A'} - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);

    // 1. Validar campos obligatorios
    if (!email || !password) {
      console.warn(`[AUTH-AUDIT] Login fallido - Campos faltantes - Email: ${email || 'N/A'}`);
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
        taskId: 'AS-TASK-06',
        data: null
      });
    }

    // 2. Validar formato de email (AS-TASK-06: Mejora de validación)
    if (!jwtHelper.validateEmail(email)) {
      console.warn(`[AUTH-AUDIT] Login fallido - Email inválido - Email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido',
        taskId: 'AS-TASK-06',
        data: null
      });
    }

    // 3. Buscar usuario por email en la BD
    const user = await userService.findByEmail(email);
    
    if (!user) {
      // Log de auditoría: Usuario no encontrado
      console.warn(`[AUTH-AUDIT] Login fallido - Usuario no encontrado - Email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        taskId: 'AS-TASK-06',
        data: null
      });
    }

    // 4. Verificar contraseña con bcrypt.compare
    const isPasswordValid = await userService.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      // Log de auditoría: Contraseña incorrecta
      console.warn(`[AUTH-AUDIT] Login fallido - Contraseña incorrecta - Email: ${email} - UserID: ${user.id}`);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        taskId: 'AS-TASK-06',
        data: null
      });
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

    // Log de auditoría: Login exitoso
    console.log(`[AUTH-AUDIT] ✓ Login exitoso - UserID: ${user.id} - Email: ${user.email} - Rol: ${user.rol} - Expira: ${jwtConfig.expiresIn} - Tiempo: ${responseTime}ms - Timestamp: ${new Date().toISOString()}`);

    // 6. Responder con token y datos del usuario (sin password)
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      taskId: 'AS-TASK-06',
      data: {
        token,
        usuario: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        },
        expiresIn: jwtConfig.expiresIn
      }
    });

  } catch (error) {
    // Log de auditoría: Error del servidor
    console.error(`[AUTH-AUDIT] ✗ Error en login - Email: ${req.body.email || 'N/A'} - Error: ${error.message} - Timestamp: ${new Date().toISOString()}`);
    
    // Error genérico del servidor
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al iniciar sesión',
      taskId: 'AS-TASK-06',
      data: { error: error.message }
    });
  }
};

/**
 * POST /logout - Invalidar sesión (revocar token JWT)
 * AS-TASK-07: Implementación completa con blacklist de tokens
 */
const logout = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // El token ya viene extraído y validado por el middleware verifyToken
    const token = req.token;
    const user = req.user; // { id, email, rol }

    // Log de auditoría: Inicio de logout
    console.log(`[AUTH-AUDIT] Solicitud de logout - UserID: ${user.id} - Email: ${user.email} - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);

    // Agregar token a blacklist
    const blacklisted = tokenBlacklistService.addToBlacklist(token, {
      id: user.id,
      email: user.email,
      rol: user.rol
    });

    if (!blacklisted) {
      console.error(`[AUTH-AUDIT] ✗ Error al invalidar token - UserID: ${user.id} - Email: ${user.email}`);
      return res.status(500).json({
        success: false,
        message: 'Error al cerrar sesión',
        taskId: 'AS-TASK-07',
        data: null
      });
    }

    // Calcular tiempo de respuesta
    const responseTime = Date.now() - startTime;

    // Log de auditoría: Logout exitoso
    console.log(`[AUTH-AUDIT] ✓ Logout exitoso - UserID: ${user.id} - Email: ${user.email} - Token invalidado - Tiempo: ${responseTime}ms - Timestamp: ${new Date().toISOString()}`);

    // Responder con éxito
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente. Token invalidado.',
      taskId: 'AS-TASK-07',
      data: {
        userId: user.id,
        email: user.email,
        logoutAt: new Date().toISOString()
      }
    });

  } catch (error) {
    // Log de auditoría: Error del servidor
    console.error(`[AUTH-AUDIT] ✗ Error en logout - UserID: ${req.user?.id || 'N/A'} - Email: ${req.user?.email || 'N/A'} - Error: ${error.message} - Timestamp: ${new Date().toISOString()}`);
    
    // Error genérico del servidor
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al cerrar sesión',
      taskId: 'AS-TASK-07',
      data: { error: error.message }
    });
  }
};

/**
 * GET /roles - Listar roles disponibles
 */
const getRoles = async (req, res) => {
  try {
    // Roles disponibles en el sistema
    const roles = [
      { id: 1, name: 'admin', description: 'Administrador del sistema' },
      { id: 2, name: 'project_manager', description: 'Gestor de proyectos' },
      { id: 3, name: 'developer', description: 'Desarrollador' },
      { id: 4, name: 'user', description: 'Usuario estándar' }
    ];

    res.status(200).json({
      success: true,
      message: 'Roles obtenidos exitosamente',
      taskId: 'AS-TASK-02',
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
 * PUT /usuarios/:id/rol - Asignar o cambiar rol a un usuario
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    // Validación
    if (!rol) {
      return res.status(400).json({
        success: false,
        message: 'El campo rol es requerido',
        taskId: 'AS-TASK-02'
      });
    }

    // TODO: Implementar lógica de actualización en BD
    res.status(200).json({
      success: true,
      message: `Rol actualizado para usuario ${id}`,
      taskId: 'AS-TASK-02',
      data: { userId: id, newRole: rol }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar rol',
      error: error.message,
      taskId: 'AS-TASK-02'
    });
  }
};

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

module.exports = {
  register,
  login,
  logout,
  getRoles,
  updateUserRole,
  health
};
