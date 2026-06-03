"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// AS-TASK-02: Controlador de autenticaci�n y autorizaci�n
// Endpoints para integraci�n con API Gateway
// AS-TASK-04: Importar servicio de usuario
const userService = require('../services/user.service');
// AS-TASK-06: Importar JWT Helper para validaci�n y generaci�n de tokens
const jwtHelper = require('../utils/jwt.helper');
// AS-TASK-07: Importar servicio de blacklist de tokens
const tokenBlacklistService = require('../services/token.blacklist.service');
// AS-TASK-08: Importar configuraci�n de roles
const { getAllRolesInfo, getRoleDescription } = require('../config/roles');
// AS-TASK-13: Importar logger con Winston para auditor�a
const logger = require('../utils/logger');
// AS-TASK-14: Importar funciones de m�tricas de Prometheus
const { recordCriticalOperation } = require('../middleware/metricsMiddleware');
/**
 * POST /register - Registro de usuarios
 * AS-TASK-04: Implementaci�n completa con PostgreSQL y bcrypt
 */
const register = async (req, res) => {
    const startTime = Date.now();
    try {
        let { nombre, email, password, rol } = req.body;
        // AS-TASK-08: Asignar rol por defecto si no se especifica
        if (!rol) {
            rol = userService.getDefaultRole();
            console.log(`[AUTH-AUDIT] Rol no especificado, asignando rol por defecto: ${rol}`);
        }
        // Log de auditor�a: Inicio de solicitud
        console.log(`[AUTH-AUDIT] Solicitud de registro recibida - Email: ${email || 'N/A'} - Rol: ${rol} - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);
        // 1. Validar campos obligatorios (rol ya no es obligatorio)
        if (!nombre || !email || !password) {
            console.warn(`[AUTH-AUDIT] Registro fallido - Campos faltantes - Email: ${email || 'N/A'}`);
            return res.status(400).json({
                success: false,
                message: 'Campos obligatorios faltantes: nombre, email, password',
                taskId: 'AS-TASK-08',
                data: null
            });
        }
        // 2. Validar formato y estructura de datos (SOLID: Delegaci�n a UserService)
        const validation = userService.validateUserData({ nombre, email, password, rol });
        if (!validation.valid) {
            console.warn(`[AUTH-AUDIT] Registro fallido - Validaci�n de datos - Email: ${email} - Errores: ${validation.errors.join(', ')}`);
            return res.status(400).json({
                success: false,
                message: 'Datos de usuario inv�lidos',
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
                message: 'El email ya est� registrado en el sistema',
                taskId: 'AS-TASK-04',
                data: null
            });
        }
        // 4. Crear usuario (bcrypt cifrado + INSERT en PostgreSQL)
        const newUser = await userService.createUser({ nombre, email, password, rol });
        // Calcular tiempo de respuesta
        const responseTime = Date.now() - startTime;
        // AS-TASK-13: Log de auditor�a con Winston
        logger.logCriticalOperation('REGISTER', {
            success: true,
            userId: newUser.id,
            email: newUser.email,
            ip: req.ip,
            detail: `Usuario registrado - Rol: ${newUser.rol}`,
            responseTime,
            taskId: 'AS-TASK-13'
        });
        // AS-TASK-14: Registrar operaci�n en m�tricas de Prometheus
        recordCriticalOperation('REGISTER', true);
        // 5. Responder con �xito (201 Created)
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            taskId: 'AS-TASK-13',
            data: {
                id: newUser.id,
                nombre: newUser.nombre,
                email: newUser.email,
                rol: newUser.rol,
                createdAt: newUser.created_at
            }
        });
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        // AS-TASK-13: Log de auditor�a con Winston
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
        // AS-TASK-14: Registrar operaci�n fallida en m�tricas
        recordCriticalOperation('REGISTER', false);
        // Manejo de errores de BD espec�ficos
        if (error.code === '23505') { // PostgreSQL unique constraint violation
            return res.status(400).json({
                success: false,
                message: 'El email ya est� registrado',
                taskId: 'AS-TASK-13',
                data: null
            });
        }
        // Error gen�rico del servidor
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al registrar usuario',
            taskId: 'AS-TASK-13',
            data: { error: error.message }
        });
    }
};
/**
 * POST /login - Inicio de sesi�n
 * AS-TASK-06: Validaci�n de credenciales y generaci�n de JWT con helper
 */
const login = async (req, res) => {
    const startTime = Date.now();
    try {
        const { email, password } = req.body;
        // Log de auditor�a: Inicio de solicitud
        console.log(`[AUTH-AUDIT] Intento de login - Email: ${email || 'N/A'} - IP: ${req.ip} - Timestamp: ${new Date().toISOString()}`);
        // 1. Validar campos obligatorios
        if (!email || !password) {
            console.warn(`[AUTH-AUDIT] Login fallido - Campos faltantes - Email: ${email || 'N/A'}`);
            return res.status(400).json({
                success: false,
                message: 'Email y contrase�a son requeridos',
                taskId: 'AS-TASK-06',
                data: null
            });
        }
        // 2. Validar formato de email (AS-TASK-06: Mejora de validaci�n)
        if (!jwtHelper.validateEmail(email)) {
            console.warn(`[AUTH-AUDIT] Login fallido - Email inv�lido - Email: ${email}`);
            return res.status(400).json({
                success: false,
                message: 'Formato de email inv�lido',
                taskId: 'AS-TASK-06',
                data: null
            });
        }
        // 3. Buscar usuario por email en la BD
        const user = await userService.findByEmail(email);
        if (!user) {
            // Log de auditor�a: Usuario no encontrado
            console.warn(`[AUTH-AUDIT] Login fallido - Usuario no encontrado - Email: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Credenciales inv�lidas',
                taskId: 'AS-TASK-06',
                data: null
            });
        }
        // 4. Verificar contrase�a con bcrypt.compare
        const isPasswordValid = await userService.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            // Log de auditor�a: Contrase�a incorrecta
            console.warn(`[AUTH-AUDIT] Login fallido - Contrase�a incorrecta - Email: ${email} - UserID: ${user.id}`);
            return res.status(401).json({
                success: false,
                message: 'Credenciales inv�lidas',
                taskId: 'AS-TASK-06',
                data: null
            });
        }
        // 5. Generar token JWT usando helper (AS-TASK-06: SOLID - Separaci�n de responsabilidades)
        const token = jwtHelper.generateToken({
            id: user.id,
            email: user.email,
            rol: user.rol
        });
        // Calcular tiempo de respuesta
        const responseTime = Date.now() - startTime;
        // Obtener configuraci�n JWT para logs
        const jwtConfig = jwtHelper.getConfig();
        // AS-TASK-13: Log de auditor�a con Winston
        logger.logCriticalOperation('LOGIN', {
            success: true,
            userId: user.id,
            email: user.email,
            ip: req.ip,
            detail: `Login exitoso - Rol: ${user.rol} - Expira: ${jwtConfig.expiresIn}`,
            responseTime,
            taskId: 'AS-TASK-13'
        });
        // AS-TASK-14: Registrar operaci�n en m�tricas de Prometheus
        recordCriticalOperation('LOGIN', true);
        // 6. Responder con token y datos del usuario (sin password)
        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            taskId: 'AS-TASK-13',
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
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        // AS-TASK-13: Log de auditor�a con Winston
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
        // AS-TASK-14: Registrar operaci�n fallida en m�tricas
        recordCriticalOperation('LOGIN', false);
        // Error gen�rico del servidor
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al iniciar sesi�n',
            taskId: 'AS-TASK-13',
            data: { error: error.message }
        });
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
 * PUT /usuarios/:id/rol - Asignar o cambiar rol a un usuario
 */
/**
 * PUT /usuarios/:id/rol - Actualizar rol de usuario
 * AS-TASK-11: Endpoint para cambiar rol de un usuario
 * Nota: Implementaci�n original creada en AS-TASK-08, reutilizada para AS-TASK-11
 *
 * Requisitos cumplidos:
 * - Recibe :id en la ruta y rol en el body
 * - Valida que el rol sea uno de: gestor, profesional, directivo
 * - Consulta PostgreSQL para verificar existencia del usuario
 * - Actualiza el rol en la base de datos
 * - Responde con formato JSON estandarizado
 * - Maneja errores con status HTTP apropiados (400, 404, 500)
 * - Registra logs de auditor�a (id, rol anterior, rol nuevo, fecha)
 * - Sigue principios SOLID (controller ? service ? config)
 */
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
    }
    catch (error) {
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
/**
 * GET /health - Health check para monitoreo
 */
/**
 * GET /usuarios/:id - Perfil p�blico de usuario (sin contrase�a), para agregaci�n BFF.
 */
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener usuario',
            error: error.message,
            taskId: 'BFF-AUTH-USER'
        });
    }
};
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
    getRolesSimple,
    getUserById,
    updateUserRole,
    health
};
