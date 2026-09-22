import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './auth/AuthContext';

const respuesta401 = () => new Response(JSON.stringify({ message: 'sin sesión' }), { status: 401 });

beforeEach(() => {
  vi.restoreAllMocks();
});

const renderizarEn = (ruta: string) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );

describe('App', () => {
  it('sin sesión, una ruta protegida redirige a /login', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(respuesta401());

    renderizarEn('/');

    expect(await screen.findByRole('heading', { name: /AssistIQ/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
  });

  it('la pantalla del kiosco es pública y no intenta el refresh de sesión admin', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((entrada) => {
      const url = String(entrada);
      if (url.includes('/auth/refresh')) return Promise.resolve(respuesta401());
      if (url.includes('/public/kiosco/demo')) {
        return Promise.resolve(
          new Response(JSON.stringify({ nombre: 'Pizzería El Sol', slug: 'demo' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        );
      }
      return Promise.reject(new Error(`fetch inesperado: ${url}`));
    });

    renderizarEn('/kiosco/demo');

    expect(await screen.findByText('Pizzería El Sol')).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const llamoRefresh = fetchMock.mock.calls.some((c) => String(c[0]).includes('/auth/refresh'));
    expect(llamoRefresh).toBe(false);
  });
});
