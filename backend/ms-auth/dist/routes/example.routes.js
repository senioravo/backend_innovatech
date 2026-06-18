// @ts-nocheck
// AS-TASK-09: Rutas de ejemplo para demostrar middleware de autorización
// Estas rutas son ejemplos de cómo usar checkRole en endpoints protegidos
import express from 'express';
const router = express.Router();
import { checkRole, checkRoleGestor, checkRoleProfesional, checkRoleDirectivo, checkAuthentication } from '../middleware/checkRole.js';
/**
 * Endpoints de ejemplo para proyectos
 * Solo GESTOR puede crear/editar proyectos
 */
// Crear proyecto - Solo gestor
router.post('/proyectos', checkRoleGestor, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Proyecto creado exitosamente (EJEMPLO)',
        taskId: 'AS-TASK-09',
        data: {
            proyecto: {
                id: 1,
                nombre: req.body.nombre || 'Proyecto ejemplo',
                createdBy: req.user.email,
                rol: req.user.rol
            }
        }
    });
});
// Editar proyecto - Solo gestor
router.put('/proyectos/:id', checkRole('proyectos', 'editar'), (req, res) => {
    res.status(200).json({
        success: true,
        message: `Proyecto ${req.params.id} editado exitosamente (EJEMPLO)`,
        taskId: 'AS-TASK-09',
        data: {
            proyectoId: req.params.id,
            editedBy: req.user.email,
            rol: req.user.rol
        }
    });
});
// Ver proyectos - Todos los roles autenticados
router.get('/proyectos', checkRole('proyectos', 'ver'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Lista de proyectos (EJEMPLO)',
        taskId: 'AS-TASK-09',
        data: {
            proyectos: [
                { id: 1, nombre: 'Proyecto Alpha', estado: 'activo' },
                { id: 2, nombre: 'Proyecto Beta', estado: 'en progreso' }
            ],
            accessedBy: req.user.email,
            rol: req.user.rol
        }
    });
});
/**
 * Endpoints de ejemplo para tareas
 * PROFESIONAL y GESTOR pueden actualizar tareas
 */
// Ver tareas - Todos los roles autenticados
router.get('/tareas', checkRole('tareas', 'ver'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Lista de tareas (EJEMPLO)',
        taskId: 'AS-TASK-09',
        data: {
            tareas: [
                { id: 1, titulo: 'Tarea 1', estado: 'pendiente', asignadoA: req.user.email },
                { id: 2, titulo: 'Tarea 2', estado: 'en progreso', asignadoA: req.user.email }
            ],
            accessedBy: req.user.email,
            rol: req.user.rol
        }
    });
});
// Actualizar tarea - Solo profesional (o gestor)
router.put('/tareas/:id', checkRoleProfesional, (req, res) => {
    res.status(200).json({
        success: true,
        message: `Tarea ${req.params.id} actualizada exitosamente (EJEMPLO)`,
        taskId: 'AS-TASK-09',
        data: {
            tareaId: req.params.id,
            nuevoEstado: req.body.estado || 'actualizado',
            updatedBy: req.user.email,
            rol: req.user.rol
        }
    });
});
// Asignar tarea - Solo gestor
router.post('/tareas/:id/asignar', checkRole('tareas', 'asignar'), (req, res) => {
    res.status(200).json({
        success: true,
        message: `Tarea ${req.params.id} asignada exitosamente (EJEMPLO)`,
        taskId: 'AS-TASK-09',
        data: {
            tareaId: req.params.id,
            asignadoA: req.body.usuarioId,
            assignedBy: req.user.email,
            rol: req.user.rol
        }
    });
});
/**
 * Endpoints de ejemplo para reportes y KPIs
 * Solo DIRECTIVO puede consultar KPIs y reportes
 */
// Ver reportes - Solo directivo
router.get('/reportes', checkRole('reportes', 'ver'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Reportes generales (EJEMPLO)',
        taskId: 'AS-TASK-09',
        data: {
            reportes: [
                { tipo: 'resumen', fecha: new Date().toISOString() },
                { tipo: 'avance', porcentaje: 75 }
            ],
            accessedBy: req.user.email,
            rol: req.user.rol
        }
    });
});
// Consultar KPIs - Solo directivo
router.get('/reportes/kpis', checkRoleDirectivo, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'KPIs del sistema (EJEMPLO)',
        taskId: 'AS-TASK-09',
        data: {
            kpis: {
                proyectosActivos: 15,
                tareasCompletadas: 120,
                usuariosActivos: 45,
                eficiencia: '87%'
            },
            accessedBy: req.user.email,
            rol: req.user.rol
        }
    });
});
// Analytics - Solo directivo
router.get('/reportes/analytics', checkRole('reportes', 'analytics'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Analytics del sistema (EJEMPLO)',
        taskId: 'AS-TASK-09',
        data: {
            analytics: {
                rendimiento: 'alto',
                tendencia: 'creciente',
                metricas: {
                    velocidad: 92,
                    calidad: 88,
                    satisfaccion: 95
                }
            },
            accessedBy: req.user.email,
            rol: req.user.rol
        }
    });
});
/**
 * Endpoint de prueba - Solo verifica autenticación (sin permisos específicos)
 */
router.get('/test/auth', checkAuthentication(), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Usuario autenticado correctamente (EJEMPLO)',
        taskId: 'AS-TASK-09',
        data: {
            user: req.user,
            message: 'Este endpoint solo verifica autenticación, no permisos específicos'
        }
    });
});
/**
 * Endpoint público - Sin middleware de autorización
 */
router.get('/test/public', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Endpoint público - No requiere autenticación (EJEMPLO)',
        taskId: 'AS-TASK-09',
        data: {
            message: 'Este endpoint es público y no requiere token'
        }
    });
});
export default router;
