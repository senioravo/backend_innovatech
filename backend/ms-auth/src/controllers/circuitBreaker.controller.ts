// AS-TASK-03: Controlador para probar Circuit Breaker
// Endpoints de prueba y monitoreo

import { validateUserWithBreaker, 
  getProjectWithBreaker,
  getAllBreakerStats } from '../services/internal.service.js';

/**
 * GET /api/circuit-breaker/test/auth
 * Probar Circuit Breaker con AuthService
 */
const testAuthServiceBreaker = async (req, res) => {
  try {
    const userId = req.query.userId || 'test-user-123';
    
    console.log(`[CircuitBreakerController] Probando AuthService con userId: ${userId}`);
    const result = await validateUserWithBreaker(userId);
    
    res.status(200).json({
      success: true,
      message: 'Llamada a AuthService exitosa',
      data: result,
      taskId: 'AS-TASK-03'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Error en Circuit Breaker',
      error: error.message,
      taskId: 'AS-TASK-03'
    });
  }
};

/**
 * GET /api/circuit-breaker/test/project
 * Probar Circuit Breaker con ProjectManager
 */
const testProjectManagerBreaker = async (req, res) => {
  try {
    const projectId = req.query.projectId || 'innovatech-backend';
    
    console.log(`[CircuitBreakerController] Probando ProjectManager con projectId: ${projectId}`);
    const result = await getProjectWithBreaker(projectId);
    
    res.status(200).json({
      success: true,
      message: 'Llamada a ProjectManager exitosa',
      data: result,
      taskId: 'AS-TASK-03'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Error en Circuit Breaker',
      error: error.message,
      taskId: 'AS-TASK-03'
    });
  }
};

/**
 * GET /api/circuit-breaker/stats
 * Obtener estadísticas de todos los Circuit Breakers
 */
const getBreakerStatistics = async (req, res) => {
  try {
    const stats = getAllBreakerStats();
    
    res.status(200).json({
      success: true,
      message: 'Estadísticas de Circuit Breakers',
      data: stats,
      taskId: 'AS-TASK-03'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message,
      taskId: 'AS-TASK-03'
    });
  }
};

export { testAuthServiceBreaker, testProjectManagerBreaker, getBreakerStatistics };