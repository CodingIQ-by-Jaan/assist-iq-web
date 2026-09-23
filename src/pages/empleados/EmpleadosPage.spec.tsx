import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../auth/AuthContext';
import { EmpleadosPage } from './EmpleadosPage';
import type { EmpleadoDto, UsuarioDto } from '../../api/tipos';

const usuarioAdminEmpresa: UsuarioDto = {
  id: 'usr-1',
  email: 'admin@pizza.hn',
  nombre: 'Admin Pizza',
  rol: 'ADMIN_EMPRESA',
  empresaId: 'emp-1',
};

const empleadoBase: EmpleadoDto = {
  id: 'e-1',
  empresaId: 'emp-1',
  codigo: '0001',
  nombre: 'María',
  apellido: 'López',
  identidad: null,
  cargo: 'Cajera',
  activo: true,
  bloqueadoHasta: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const respuestaJson = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'content-type': 'application/json' } });

beforeEach(() => {
  vi.restoreAllMocks();
});

const renderizar = () =>
  render(
    <MemoryRouter initialEntries={['/empleados']}>
      <AuthProvider>
        <EmpleadosPage />
      </AuthProvider>
    </MemoryRouter>,
  );

describe('EmpleadosPage', () => {
  it('lista los empleados que devuelve el API', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((entrada) => {
      const url = String(entrada);
      if (url.includes('/auth/refresh')) return Promise.resolve(respuestaJson({ accessToken: 'token' }));
      if (url.includes('/auth/me')) return Promise.resolve(respuestaJson(usuarioAdminEmpresa));
      if (url.includes('/empleados')) {
        return Promise.resolve(
          respuestaJson({ data: [empleadoBase], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } }),
        );
      }
      return Promise.reject(new Error(`fetch inesperado: ${url}`));
    });

    renderizar();

    expect(await screen.findByText('María López')).toBeInTheDocument();
    expect(screen.getByText('0001')).toBeInTheDocument();
    expect(screen.getByText('Cajera')).toBeInTheDocument();
    // ADMIN_EMPRESA no ve el selector de empresas (queda acotado a la suya)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('crea un empleado y muestra el PIN generado una sola vez', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((entrada, init) => {
      const url = String(entrada);
      const metodo = init?.method ?? 'GET';

      if (url.includes('/auth/refresh')) return Promise.resolve(respuestaJson({ accessToken: 'token' }));
      if (url.includes('/auth/me')) return Promise.resolve(respuestaJson(usuarioAdminEmpresa));
      if (metodo === 'POST' && url.includes('/empleados')) {
        return Promise.resolve(
          respuestaJson(
            { empleado: { ...empleadoBase, id: 'e-2', nombre: 'Juan', apellido: 'Pérez', codigo: '0002' }, pin: '4827' },
            201,
          ),
        );
      }
      if (url.includes('/empleados')) {
        return Promise.resolve(
          respuestaJson({ data: [empleadoBase], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } }),
        );
      }
      return Promise.reject(new Error(`fetch inesperado: ${url}`));
    });

    renderizar();
    expect(await screen.findByText('María López')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo empleado' }));

    fireEvent.change(await screen.findByLabelText('Nombre'), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Pérez' } });

    fireEvent.click(screen.getByRole('button', { name: 'Crear empleado' }));

    expect(await screen.findByText('4827')).toBeInTheDocument();

    const llamoCrear = fetchMock.mock.calls.some(
      ([entrada, init]) => String(entrada).includes('/empleados') && init?.method === 'POST',
    );
    expect(llamoCrear).toBe(true);
  });
});
