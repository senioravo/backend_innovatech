import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import KpiDashboard from './KpiDashboard';

const sampleData = {
  resumen: {
    totalProyectos: 2,
    totalTareas: 4,
    tasaCompletadas: 0.5,
    porEstado: {
      PENDING: 1,
      IN_PROGRESS: 1,
      IN_REVIEW: 0,
      DONE: 2
    }
  },
  proyectos: [{ id: 1, nombre: 'Alpha', descripcion: 'Proyecto alpha' }],
  tareasRecientes: [
    { id: 10, titulo: 'Diseñar API', estado: 'IN_PROGRESS', proyectoNombre: 'Alpha' }
  ]
};

describe('KpiDashboard', () => {
  afterEach(() => cleanup());

  it('muestra estado de carga', () => {
    render(<KpiDashboard loading error="" data={null} />);
    expect(screen.getByText(/Cargando indicadores/i)).toBeInTheDocument();
  });

  it('muestra error', () => {
    render(<KpiDashboard loading={false} error="Fallo KPI" data={null} />);
    expect(screen.getByText('Fallo KPI')).toBeInTheDocument();
  });

  it('muestra estado vacío', () => {
    render(<KpiDashboard loading={false} error="" data={{}} />);
    expect(screen.getByText(/No hay datos de progreso/i)).toBeInTheDocument();
  });

  it('renderiza métricas y tareas recientes', () => {
    render(<KpiDashboard loading={false} error="" data={sampleData} />);

    expect(screen.getByRole('region', { name: 'Panel de progreso' })).toBeInTheDocument();
    expect(screen.getByText('Proyectos activos')).toBeInTheDocument();
    expect(screen.getByText('Diseñar API')).toBeInTheDocument();
    expect(screen.getAllByText('En progreso').length).toBeGreaterThan(0);
    expect(screen.getByText('Proyecto alpha')).toBeInTheDocument();
  });
});
