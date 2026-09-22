import { beforeEach, describe, expect, it, vi } from 'vitest';
import { peticion } from './client';
import { guardarToken, obtenerToken } from './token-store';

const respuestaJson = (status: number, cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const respuestaSinCuerpo = (status: number) => new Response(null, { status });

beforeEach(() => {
  guardarToken(null);
  vi.restoreAllMocks();
});

describe('peticion', () => {
  it('envía el Authorization solo cuando hay token guardado', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(respuestaJson(200, { ok: true }));

    await peticion('/algo');
    expect(fetchMock.mock.calls[0][1]?.headers).not.toHaveProperty('Authorization');

    guardarToken('token-123');
    await peticion('/algo');
    expect((fetchMock.mock.calls[1][1]?.headers as Record<string, string>).Authorization).toBe(
      'Bearer token-123',
    );
  });

  it('incluye credentials: include para que viaje la cookie de refresh', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(respuestaJson(200, {}));
    await peticion('/algo');
    expect(fetchMock.mock.calls[0][1]?.credentials).toBe('include');
  });

  it('en un 401 intenta refrescar y reintenta la petición original una sola vez', async () => {
    guardarToken('token-viejo');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(respuestaJson(401, { message: 'expirado' })) // petición original
      .mockResolvedValueOnce(respuestaJson(200, { accessToken: 'token-nuevo' })) // /auth/refresh
      .mockResolvedValueOnce(respuestaJson(200, { dato: 'ok' })); // reintento

    const resultado = await peticion('/protegida');

    expect(resultado).toEqual({ dato: 'ok' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain('/auth/refresh');
    expect(obtenerToken()).toBe('token-nuevo');
  });

  it('si el refresh también falla, propaga el 401 original y limpia el token', async () => {
    guardarToken('token-viejo');
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(respuestaJson(401, { message: 'expirado' }))
      .mockResolvedValueOnce(respuestaJson(401, { message: 'sin sesión' }));

    await expect(peticion('/protegida')).rejects.toMatchObject({ status: 401 });
    expect(obtenerToken()).toBeNull();
  });

  it('no intenta refrescar cuando sinRefresh es true (evita bucles en login/refresh)', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(respuestaJson(401, { message: 'mal' }));
    await expect(peticion('/auth/login', { sinRefresh: true, method: 'POST' })).rejects.toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('coalesce: dos 401 simultáneos disparan un solo /auth/refresh', async () => {
    guardarToken('token-viejo');
    let resolverRefresh!: (r: Response) => void;
    const promesaRefresh = new Promise<Response>((resolve) => {
      resolverRefresh = resolve;
    });

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(respuestaJson(401, {}))
      .mockResolvedValueOnce(respuestaJson(401, {}))
      .mockImplementationOnce(() => promesaRefresh)
      .mockResolvedValueOnce(respuestaJson(200, { a: 1 }))
      .mockResolvedValueOnce(respuestaJson(200, { b: 2 }));

    const p1 = peticion('/uno');
    const p2 = peticion('/dos');

    resolverRefresh(respuestaJson(200, { accessToken: 'nuevo' }));
    await Promise.all([p1, p2]);

    const llamadasRefresh = fetchMock.mock.calls.filter((c) => String(c[0]).includes('/auth/refresh'));
    expect(llamadasRefresh).toHaveLength(1);
  });

  it('devuelve undefined en respuestas 204', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(respuestaSinCuerpo(204));
    await expect(peticion('/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('arma la URL con query params, omitiendo los undefined', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(respuestaJson(200, {}));
    await peticion('/empleados', { params: { page: 2, search: undefined, activo: true } });
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('page=2');
    expect(url).toContain('activo=true');
    expect(url).not.toContain('search');
  });
});
