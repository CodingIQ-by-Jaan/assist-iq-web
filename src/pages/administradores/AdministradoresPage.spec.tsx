import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AdministradoresPage } from './AdministradoresPage';
import type { EmpresaDto, UsuarioAdminDto } from '../../api/tipos';

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

const administradorBase: UsuarioAdminDto = {
  id: 'ua-1',
  email: 'admin@pizzeria.com',
  nombre: 'Ana Martínez',
  rol: 'ADMIN_EMPRESA',
  empresaId: 'emp-1',
  activo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const respuestaJson = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'content-type': 'application/json' } });

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('AdministradoresPage', () => {
  it('lista los administradores que devuelve el API', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((entrada) => {
      const url = String(entrada);
      if (url.includes('/empresas')) {
        return Promise.resolve(
          respuestaJson({ data: [empresaBase], meta: { total: 1, page: 1, limit: 100, totalPages: 1 } }),
        );
      }
      if (url.includes('/usuarios-admin')) {
        return Promise.resolve(
          respuestaJson({ data: [administradorBase], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } }),
        );
      }
      return Promise.reject(new Error(`fetch inesperado: ${url}`));
    });

    render(<AdministradoresPage />);

    expect(await screen.findByText('Ana Martínez')).toBeInTheDocument();
    expect(screen.getByText('admin@pizzeria.com')).toBeInTheDocument();
  });

  it('crea un administrador y muestra la contraseña generada una sola vez', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((entrada, init) => {
      const url = String(entrada);
      const metodo = init?.method ?? 'GET';

      if (url.includes('/empresas')) {
        return Promise.resolve(
          respuestaJson({ data: [empresaBase], meta: { total: 1, page: 1, limit: 100, totalPages: 1 } }),
        );
      }
      if (metodo === 'POST' && url.includes('/usuarios-admin')) {
        return Promise.resolve(
          respuestaJson(
            { usuario: { ...administradorBase, id: 'ua-2', nombre: 'Carlos Ruiz', email: 'carlos@pizzeria.com' }, password: 'Xy7kPqRt2m' },
            201,
          ),
        );
      }
      if (url.includes('/usuarios-admin')) {
        return Promise.resolve(
          respuestaJson({ data: [administradorBase], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } }),
        );
      }
      return Promise.reject(new Error(`fetch inesperado: ${url}`));
    });

    render(<AdministradoresPage />);
    expect(await screen.findByText('Ana Martínez')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo administrador' }));

    fireEvent.change(await screen.findByLabelText('Empresa'), { target: { value: empresaBase.id } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'carlos@pizzeria.com' } });
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Carlos Ruiz' } });

    fireEvent.click(screen.getByRole('button', { name: 'Crear administrador' }));

    expect(await screen.findByText('Xy7kPqRt2m')).toBeInTheDocument();

    const llamoCrear = fetchMock.mock.calls.some(
      ([entrada, init]) => String(entrada).includes('/usuarios-admin') && init?.method === 'POST',
    );
    expect(llamoCrear).toBe(true);
  });
});
