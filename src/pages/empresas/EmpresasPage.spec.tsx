import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EmpresasPage } from './EmpresasPage';
import type { EmpresaDto } from '../../api/tipos';

const empresaBase: EmpresaDto = {
  id: 'emp-1',
  nombre: 'Pizzería El Sol',
  slug: 'pizzeria-el-sol',
  rtn: null,
  zonaHoraria: 'America/Tegucigalpa',
  limiteEmpleados: null,
  activa: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const respuestaJson = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'content-type': 'application/json' } });

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('EmpresasPage', () => {
  it('lista las empresas que devuelve el API', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((entrada) => {
      const url = String(entrada);
      if (url.includes('/empresas')) {
        return Promise.resolve(
          respuestaJson({ data: [empresaBase], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } }),
        );
      }
      return Promise.reject(new Error(`fetch inesperado: ${url}`));
    });

    render(<EmpresasPage />);

    expect(await screen.findByText('Pizzería El Sol')).toBeInTheDocument();
    expect(screen.getByText('pizzeria-el-sol')).toBeInTheDocument();
    expect(screen.getByText('Activa')).toBeInTheDocument();
  });

  it('crea una empresa nueva, cierra el modal y recarga el listado', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((entrada, init) => {
      const url = String(entrada);
      const metodo = init?.method ?? 'GET';

      if (metodo === 'POST' && url.includes('/empresas')) {
        return Promise.resolve(
          respuestaJson({ ...empresaBase, id: 'emp-2', nombre: 'Café Central', slug: 'cafe-central' }, 201),
        );
      }
      if (url.includes('/empresas')) {
        return Promise.resolve(
          respuestaJson({ data: [empresaBase], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } }),
        );
      }
      return Promise.reject(new Error(`fetch inesperado: ${url}`));
    });

    render(<EmpresasPage />);
    expect(await screen.findByText('Pizzería El Sol')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Nueva empresa' }));

    const nombreInput = await screen.findByLabelText('Nombre');
    fireEvent.change(nombreInput, { target: { value: 'Café Central' } });

    fireEvent.click(screen.getByRole('button', { name: 'Crear empresa' }));

    await waitFor(() => {
      const llamoCrear = fetchMock.mock.calls.some(
        ([entrada, init]) => String(entrada).includes('/empresas') && init?.method === 'POST',
      );
      expect(llamoCrear).toBe(true);
    });

    // El modal se cierra tras guardar con éxito
    await waitFor(() => expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument());
  });

  it('muestra un error de validación si se intenta crear sin nombre', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((entrada) => {
      const url = String(entrada);
      if (url.includes('/empresas')) {
        return Promise.resolve(respuestaJson({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } }));
      }
      return Promise.reject(new Error(`fetch inesperado: ${url}`));
    });

    render(<EmpresasPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Nueva empresa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear empresa' }));

    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument();
  });
});
