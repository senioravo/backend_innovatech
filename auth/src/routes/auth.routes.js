//  Integrar con API Gateway
// Rutas de autenticación y autorización

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

//  Importar middleware de autenticación
const { verifyToken } = require('../middleware/auth.middleware');

//  Importar middleware de auditoría
const { auditMiddleware, auditCriticalOperation } = require('../middleware/auditMiddleware');

//  Aplicar auditoría a todas las rutas (excepto health check)
router.use((req, res, next) => {
  if (req.path !== '/health') {
    return auditMiddleware(req, res, next);
  }
  next();
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroRequest'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos inválidos o email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Endpoints de autenticación
router.post('/register', auditCriticalOperation('REGISTER'), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', auditCriticalOperation('LOGIN'), authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       401:
 *         description: Token inválido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
//  Logout requiere token válido
router.post('/logout', verifyToken, auditCriticalOperation('LOGOUT'), authController.logout);

/**
 * @swagger
 * /api/auth/roles:
 *   get:
 *     summary: Obtener todos los roles con información completa
 *     tags: [Roles]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de roles con permisos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rol'
 */
// Endpoints de roles
router.get('/roles', authController.getRoles);

/**
 * @swagger
 * /api/auth/roles/simple:
 *   get:
 *     summary: Obtener lista simple de nombres de roles
 *     tags: [Roles]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de nombres de roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["gestor", "profesional", "directivo"]
 */
//  Endpoint simplificado que retorna solo nombres de roles
router.get('/roles/simple', authController.getRolesSimple);

/**
 * @swagger
 * /api/auth/usuarios/{id}/rol:
 *   put:
 *     summary: Actualizar el rol de un usuario
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rol]
 *             properties:
 *               rol:
 *                 type: string
 *                 enum: [gestor, profesional, directivo]
 *                 example: "profesional"
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Rol inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/usuarios/:id/rol', auditCriticalOperation('ROLE_CHANGE'), authController.updateUserRole);

/**
 * @swagger
 * /api/auth/health:
 *   get:
 *     summary: Health check del microservicio
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
// Health check
router.get('/health', authController.health);

module.exports = router;

