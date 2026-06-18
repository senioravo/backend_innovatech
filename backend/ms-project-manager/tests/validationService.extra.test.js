import ValidationService from '../src/services/validationService.js';

describe('validationService - casos adicionales', () => {
  test('validateTaskStatusInput rechaza status vacío', () => {
    const result = ValidationService.validateTaskStatusInput({ status: '   ' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('status is required');
  });

  test('validateProjectInput rechaza fechas con formato inválido', () => {
    const result = ValidationService.validateProjectInput({
      name: 'Proyecto OK',
      description: 'Descripción válida larga',
      startDate: 'fecha-invalida'
    });
    expect(result.isValid).toBe(false);
  });

  test('validateUpdateInput exige al menos un campo', () => {
    const result = ValidationService.validateUpdateInput({});
    expect(result.isValid).toBe(false);
  });

  test('validateAssigneeInput rechaza assigneeId vacío', () => {
    const result = ValidationService.validateAssigneeInput({ assigneeId: '   ' });
    expect(result.isValid).toBe(false);
  });

  test('validateTaskUpdateInput exige al menos un campo', () => {
    const result = ValidationService.validateTaskUpdateInput({});
    expect(result.isValid).toBe(false);
  });

  test('validateTaskUpdateInput rechaza completed no booleano', () => {
    const result = ValidationService.validateTaskUpdateInput({ completed: 'yes' });
    expect(result.isValid).toBe(false);
  });

  test('validateTaskInput acepta fechas opcionales válidas', () => {
    const result = ValidationService.validateTaskInput({
      title: 'Tarea válida',
      startDate: '2026-03-01',
      endDate: '2026-03-15'
    });
    expect(result.isValid).toBe(true);
  });

  test('optionalIsoDate acepta null y cadena vacía', () => {
    const errors = [];
    expect(ValidationService.optionalIsoDate({ endDate: null }, 'endDate', errors)).toBeNull();
    expect(ValidationService.optionalIsoDate({ endDate: '' }, 'endDate', errors)).toBeNull();
    expect(errors).toHaveLength(0);
  });
});
