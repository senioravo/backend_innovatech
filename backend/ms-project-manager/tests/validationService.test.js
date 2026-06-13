const ValidationService = require('../src/services/validationService');

describe('ValidationService', () => {
  test('validateProjectInput rechaza nombre corto', () => {
    const result = ValidationService.validateProjectInput({
      name: 'ab',
      description: 'descripcion valida larga'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('name'))).toBe(true);
  });

  test('validateProjectInput acepta datos válidos', () => {
    const result = ValidationService.validateProjectInput({
      name: 'Mi proyecto',
      description: 'Descripcion con mas de diez caracteres',
      startDate: '2026-01-01',
      endDate: '2026-12-31'
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('validateProjectInput rechaza endDate antes de startDate', () => {
    const result = ValidationService.validateProjectInput({
      name: 'Mi proyecto',
      description: 'Descripcion con mas de diez caracteres',
      startDate: '2026-12-01',
      endDate: '2026-01-01'
    });
    expect(result.isValid).toBe(false);
  });

  test('validateProjectStatusInput normaliza status válido', () => {
    const result = ValidationService.validateProjectStatusInput({ status: 'TERMINATED' });
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe('terminated');
  });

  test('validateProjectStatusInput rechaza status inválido', () => {
    const result = ValidationService.validateProjectStatusInput({ status: 'paused' });
    expect(result.isValid).toBe(false);
  });

  test('validateTaskStatusInput normaliza status válido', () => {
    const result = ValidationService.validateTaskStatusInput({ status: 'in_review' });
    expect(result.isValid).toBe(true);
    expect(result.normalized).toBe('IN_REVIEW');
  });

  test('validateTaskInput exige title mínimo 3 caracteres', () => {
    const result = ValidationService.validateTaskInput({ title: 'ab' });
    expect(result.isValid).toBe(false);
  });

  test('validateUpdateInput acepta actualización parcial', () => {
    const result = ValidationService.validateUpdateInput({
      name: 'Proyecto actualizado',
      endDate: '2026-12-31'
    });
    expect(result.isValid).toBe(true);
  });

  test('validateTaskUpdateInput acepta cambio de status', () => {
    const result = ValidationService.validateTaskUpdateInput({ status: 'IN_PROGRESS' });
    expect(result.isValid).toBe(true);
  });

  test('validateAssigneeInput acepta assigneeId válido', () => {
    const result = ValidationService.validateAssigneeInput({ assigneeId: 'user-42' });
    expect(result.isValid).toBe(true);
  });
});
