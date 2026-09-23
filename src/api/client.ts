import { API_URL } from './config';
import { ApiError, type CuerpoErrorApi } from './errors';
import { guardarToken, obtenerToken } from './token-store';

export type Metodo = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface OpcionesPeticion {
  method?: Metodo;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  // Evita el intento de refresh (lo usa el propio refresh y el login, para no encadenarse)
  sinRefresh?: boolean;
}

const construirUrl = (ruta: string, params?: OpcionesPeticion['params']) => {
  const url = new URL(API_URL + ruta);
  Object.entries(params ?? {}).forEach(([clave, valor]) => {
    if (valor !== undefined) url.searchParams.set(clave, String(valor));
  });
  return url.toString();
};

// Coalesce: si varias peticiones reciben 401 a la vez, solo se refresca una vez
let refrescoEnCurso: Promise<boolean> | null = null;

const refrescarSesion = (): Promise<boolean> => {
  refrescoEnCurso ??= peticionCruda('/auth/refresh', { method: 'POST', sinRefresh: true })
    .then((data) => {
      guardarToken((data as { accessToken: string }).accessToken);
      return true;
    })
    .catch(() => {
      guardarToken(null);
      return false;
    })
    .finally(() => {
      refrescoEnCurso = null;
    });
  return refrescoEnCurso;
};

const peticionCruda = async (ruta: string, opciones: OpcionesPeticion = {}) => {
  const token = obtenerToken();
  const respuesta = await fetch(construirUrl(ruta, opciones.params), {
    method: opciones.method ?? 'GET',
    headers: {
      ...(opciones.body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    // Necesario para que la cookie httpOnly del refresh token viaje con la petición
    credentials: 'include',
    body: opciones.body !== undefined ? JSON.stringify(opciones.body) : undefined,
  });

  if (respuesta.status === 204) return undefined;

  const esJson = respuesta.headers.get('content-type')?.includes('application/json');
  const cuerpo = esJson ? await respuesta.json().catch(() => undefined) : undefined;

  if (!respuesta.ok) throw new ApiError(respuesta.status, cuerpo as CuerpoErrorApi | undefined);
  return cuerpo;
};

// Punto único de entrada: reintenta una vez tras un refresh exitoso en peticiones autenticadas
export const peticion = async <T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> => {
  try {
    return (await peticionCruda(ruta, opciones)) as T;
  } catch (error) {
    const esNoAutorizado = esApiError401(error);
    if (esNoAutorizado && !opciones.sinRefresh) {
      const refrescado = await refrescarSesion();
      if (refrescado) return (await peticionCruda(ruta, opciones)) as T;
    }
    throw error;
  }
};

const esApiError401 = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 401;

// Para descargas binarias (PDF, etc.): no asume que la respuesta es JSON.
// Reintenta una vez tras un refresh exitoso, igual que peticion().
export const peticionArchivo = async (ruta: string, opciones: OpcionesPeticion = {}): Promise<Blob> => {
  const token = obtenerToken();
  const respuesta = await fetch(construirUrl(ruta, opciones.params), {
    method: opciones.method ?? 'GET',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  if (respuesta.status === 401 && !opciones.sinRefresh) {
    const refrescado = await refrescarSesion();
    if (refrescado) return peticionArchivo(ruta, { ...opciones, sinRefresh: true });
  }

  if (!respuesta.ok) {
    const esJson = respuesta.headers.get('content-type')?.includes('application/json');
    const cuerpo = esJson ? await respuesta.json().catch(() => undefined) : undefined;
    throw new ApiError(respuesta.status, cuerpo as CuerpoErrorApi | undefined);
  }

  return respuesta.blob();
};

export { ApiError, esApiError } from './errors';
