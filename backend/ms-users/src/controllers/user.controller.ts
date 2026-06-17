import userService from '../services/user.service.js';
import logger from '../utils/logger.js';
import { recordCrudOperation } from '../middleware/metricsMiddleware.js';
import {
  userToDto,
  usersToDto,
  createUserDto,
  updateUserDto,
  successResponseDto,
  errorResponseDto,
  validateUserData
} from '../dtos/userDto.js';

const createUser = async (req, res) => {
  const startTime = Date.now();

  try {
    const userData = createUserDto(req.body);

    if (!userData.rol) {
      userData.rol = userService.getDefaultRole();
      logger.info(`[USER-CONTROLLER] Rol no especificado, asignando rol por defecto: ${userData.rol}`);
    }

    logger.info(`[USER-CONTROLLER] Solicitud de creación de usuario - Email: ${userData.email || 'N/A'} - Rol: ${userData.rol} - IP: ${req.ip}`);

    if (!userData.nombre || !userData.email || !userData.password) {
      recordCrudOperation('create', 'error');
      return res.status(400).json(
        errorResponseDto('Campos obligatorios faltantes: nombre, email, password')
      );
    }

    const validation = validateUserData(userData);
    if (!validation.valid) {
      recordCrudOperation('create', 'error');
      return res.status(400).json(
        errorResponseDto('Datos de usuario inválidos', { errors: validation.errors })
      );
    }

    const emailExists = await userService.emailExists(userData.email);
    if (emailExists) {
      recordCrudOperation('create', 'error');
      return res.status(400).json(
        errorResponseDto('El email ya está registrado en el sistema')
      );
    }

    const newUser = await userService.createUser(userData);

    const duration = Date.now() - startTime;
    logger.info(`[USER-CONTROLLER] Usuario creado exitosamente - ID: ${newUser.id} - Tiempo: ${duration}ms`);

    recordCrudOperation('create', 'success');

    return res.status(201).json(
      successResponseDto('Usuario creado exitosamente', { user: userToDto(newUser) })
    );
  } catch (error) {
    const err = error as Error;
    logger.error('[USER-CONTROLLER] Error al crear usuario', {
      error: err.message,
      stack: err.stack
    });

    recordCrudOperation('create', 'error');

    return res.status(500).json(
      errorResponseDto(err.message || 'Error al crear usuario')
    );
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`[USER-CONTROLLER] Solicitud de obtener usuario - ID: ${id}`);

    if (isNaN(Number(id))) {
      return res.status(400).json(
        errorResponseDto('ID de usuario inválido')
      );
    }

    const user = await userService.findById(parseInt(id));

    if (!user) {
      recordCrudOperation('read', 'error');
      return res.status(404).json(
        errorResponseDto('Usuario no encontrado')
      );
    }

    recordCrudOperation('read', 'success');

    return res.status(200).json(
      successResponseDto('Usuario encontrado', { user: userToDto(user) })
    );
  } catch (error) {
    const err = error as Error;
    logger.error('[USER-CONTROLLER] Error al obtener usuario', {
      error: err.message,
      userId: req.params.id
    });

    recordCrudOperation('read', 'error');

    return res.status(500).json(
      errorResponseDto('Error al obtener usuario')
    );
  }
};

const listUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      rol = null,
      search = null
    } = req.query;

    logger.info(`[USER-CONTROLLER] Solicitud de listar usuarios - Page: ${page}, Limit: ${limit}, Rol: ${rol || 'todos'}`);

    const result = await userService.findAll({
      page: parseInt(String(page)),
      limit: parseInt(String(limit)),
      rol,
      search
    });

    recordCrudOperation('read', 'success');

    return res.status(200).json(
      successResponseDto('Usuarios obtenidos exitosamente', {
        users: usersToDto(result.users),
        pagination: result.pagination
      })
    );
  } catch (error) {
    const err = error as Error;
    logger.error('[USER-CONTROLLER] Error al listar usuarios', {
      error: err.message
    });

    recordCrudOperation('read', 'error');

    return res.status(500).json(
      errorResponseDto('Error al listar usuarios')
    );
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`[USER-CONTROLLER] Solicitud de actualización de usuario - ID: ${id}`);

    if (isNaN(Number(id))) {
      return res.status(400).json(
        errorResponseDto('ID de usuario inválido')
      );
    }

    const updates = updateUserDto(req.body);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(
        errorResponseDto('No hay campos para actualizar')
      );
    }

    if (updates.email || updates.password || updates.nombre) {
      const validation = userService.validateUserData(updates);
      if (!validation.valid) {
        recordCrudOperation('update', 'error');
        return res.status(400).json(
          errorResponseDto('Datos de usuario inválidos', { errors: validation.errors })
        );
      }
    }

    const updatedUser = await userService.updateUser(parseInt(id), updates);

    logger.info(`[USER-CONTROLLER] Usuario actualizado exitosamente - ID: ${id}`);

    recordCrudOperation('update', 'success');

    return res.status(200).json(
      successResponseDto('Usuario actualizado exitosamente', { user: userToDto(updatedUser) })
    );
  } catch (error) {
    const err = error as Error;
    logger.error('[USER-CONTROLLER] Error al actualizar usuario', {
      error: err.message,
      userId: req.params.id
    });

    recordCrudOperation('update', 'error');

    return res.status(err.message.includes('no encontrado') ? 404 : 500).json(
      errorResponseDto(err.message || 'Error al actualizar usuario')
    );
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`[USER-CONTROLLER] Solicitud de eliminación de usuario - ID: ${id}`);

    if (isNaN(Number(id))) {
      return res.status(400).json(
        errorResponseDto('ID de usuario inválido')
      );
    }

    await userService.deleteUser(parseInt(id));

    logger.info(`[USER-CONTROLLER] Usuario eliminado exitosamente - ID: ${id}`);

    recordCrudOperation('delete', 'success');

    return res.status(200).json(
      successResponseDto('Usuario eliminado exitosamente')
    );
  } catch (error) {
    const err = error as Error;
    logger.error('[USER-CONTROLLER] Error al eliminar usuario', {
      error: err.message,
      userId: req.params.id
    });

    recordCrudOperation('delete', 'error');

    return res.status(err.message.includes('no encontrado') ? 404 : 500).json(
      errorResponseDto(err.message || 'Error al eliminar usuario')
    );
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    logger.info(`[USER-CONTROLLER] Solicitud de cambio de rol - ID: ${id} - Nuevo rol: ${rol}`);

    if (isNaN(Number(id))) {
      return res.status(400).json(
        errorResponseDto('ID de usuario inválido')
      );
    }

    if (!rol) {
      return res.status(400).json(
        errorResponseDto('El campo rol es obligatorio')
      );
    }

    const updatedUser = await userService.changeUserRole(parseInt(id), rol);

    logger.info(`[USER-CONTROLLER] Rol de usuario actualizado - ID: ${id} - Nuevo rol: ${rol}`);

    recordCrudOperation('update', 'success');

    return res.status(200).json(
      successResponseDto('Rol de usuario actualizado exitosamente', { user: userToDto(updatedUser) })
    );
  } catch (error) {
    const err = error as Error;
    logger.error('[USER-CONTROLLER] Error al cambiar rol', {
      error: err.message,
      userId: req.params.id
    });

    recordCrudOperation('update', 'error');

    return res.status(err.message.includes('no encontrado') ? 404 : 400).json(
      errorResponseDto(err.message || 'Error al cambiar rol de usuario')
    );
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    logger.info(`[USER-CONTROLLER] Solicitud de buscar usuario por email - Email: ${email}`);

    const user = await userService.findByEmail(email);

    if (!user) {
      recordCrudOperation('read', 'error');
      return res.status(404).json(
        errorResponseDto('Usuario no encontrado')
      );
    }

    recordCrudOperation('read', 'success');

    return res.status(200).json(
      successResponseDto('Usuario encontrado', { user: userToDto(user) })
    );
  } catch (error) {
    const err = error as Error;
    logger.error('[USER-CONTROLLER] Error al buscar usuario por email', {
      error: err.message
    });

    recordCrudOperation('read', 'error');

    return res.status(500).json(
      errorResponseDto('Error al buscar usuario')
    );
  }
};

export {
  createUser,
  getUserById,
  listUsers,
  updateUser,
  deleteUser,
  changeUserRole,
  getUserByEmail
};
