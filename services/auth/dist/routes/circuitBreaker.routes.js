"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// AS-TASK-03: Rutas para pruebas de Circuit Breaker
const express = require('express');
const router = express.Router();
const circuitBreakerController = require('../controllers/circuitBreaker.controller');
// Endpoints de prueba para Circuit Breaker
router.get('/test/auth', circuitBreakerController.testAuthServiceBreaker);
router.get('/test/project', circuitBreakerController.testProjectManagerBreaker);
router.get('/stats', circuitBreakerController.getBreakerStatistics);
module.exports = router;
