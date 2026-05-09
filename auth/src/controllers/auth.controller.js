// AS-TASK-02: Controlador de autenticación y autorización
// Endpoints para integración con API Gateway

/**
 * POST /register - Registro de usuarios
 */
const register = async (req, res) => {
  try {
    // TODO: Implementar lógica de registro
    const { username, email, password, rol } = req.body;
    
    // Validación básica
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos',
        taskId: 'AS-TASK-02'
      });
    }

    // Respuesta temporal (endpoint en desarrollo)
    res.status(201).json({
      success: true,
      message: 'Endpoint /register en desarrollo',
      taskId: 'AS-TASK-02',
      data: { username, email, rol: rol || 'user' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message,
      taskId: 'AS-TASK-02'
    });
  }
};

/**
 * POST /login - Inicio de sesión
 */
const login = async (req, res) => {
  try {
    // TODO: Implementar lógica de login y generación de JWT
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
        taskId: 'AS-TASK-02'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Endpoint /login en desarrollo',
      taskId: 'AS-TASK-02',
      data: { email }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message,
      taskId: 'AS-TASK-02'
    });
  }
};

/**
 * POST /logout - Invalidar sesión (revocar token JWT)
 */
const logout = async (req, res) => {
  try {
    // TODO: Implementar lógica de invalidación de token
    const { token } = req.body;

    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente',
      taskId: 'AS-TASK-02'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
      error: error.message,
      taskId: 'AS-TASK-02'
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
