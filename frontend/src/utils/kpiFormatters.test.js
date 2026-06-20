import { describe, expect, it } from 'vitest';
import {
  buildEstadoItems,
  formatEstado,
  formatPorcentaje,
  hasKpiResumen
} from './kpiFormatters';

describe('kpiFormatters', () => {
  it('formatea estados conocidos', () => {
    expect(formatEstado('PENDING')).toBe('Pendiente');
    expect(formatEstado('DONE')).toBe('Completada');
    expect(formatEstado('CUSTOM')).toBe('CUSTOM');
  });

  it('formatea porcentaje entre 0 y 100', () => {
    expect(formatPorcentaje(0.456)).toBe(46);
    expect(formatPorcentaje(1.5)).toBe(100);
    expect(formatPorcentaje('invalid')).toBe(0);
  });

  it('construye items de estado en orden fijo', () => {
    const items = buildEstadoItems({ DONE: 2, PENDING: 1 });
    expect(items).toHaveLength(4);
    expect(items[0]).toEqual({ key: 'PENDING', label: 'Pendiente', count: 1 });
    expect(items[3].count).toBe(2);
  });

  it('detecta resumen KPI válido', () => {
    expect(hasKpiResumen({ resumen: { totalTareas: 1 } })).toBe(true);
    expect(hasKpiResumen({})).toBe(false);
    expect(hasKpiResumen(null)).toBe(false);
  });
});
