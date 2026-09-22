import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { login as loginApi, logout as logoutApi, obtenerPerfil, refrescar } from '../api/endpoints/auth';
import { guardarToken } from '../api/token-store';
import { esApiError } from '../api/errors';
import type { UsuarioDto } from '../api/tipos';

interface AuthContextValue {
  usuario: UsuarioDto | null;
  // true mientras se intenta el refresh silencioso al cargar la app
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<UsuarioDto | null>(null);
  const [cargando, setCargando] = useState(true);
  const ubicacion = useLocation();
  // El kiosco es público y no tiene cookie de sesión de admin: evita una llamada inútil
  // (o, peor, "heredar" por accidente la sesión de admin de ese mismo navegador)
  const esRutaPublica = ubicacion.pathname.startsWith('/kiosco/');

  // Al montar: intenta renovar sesión con la cookie httpOnly (sobrevive a un F5)
  useEffect(() => {
    if (esRutaPublica) {
      setCargando(false);
      return;
    }

    let cancelado = false;

    (async () => {
      try {
        const { accessToken } = await refrescar();
        guardarToken(accessToken);
        const perfil = await obtenerPerfil();
        if (!cancelado) setUsuario(perfil);
      } catch {
        guardarToken(null);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe correr una vez al montar
  }, [esRutaPublica]);

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const { accessToken, usuario: perfil } = await loginApi({ email, password });
    guardarToken(accessToken);
    setUsuario(perfil);
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      // Si el logout falla en el servidor igual limpiamos el estado local
      if (!esApiError(error)) throw error;
    } finally {
      guardarToken(null);
      setUsuario(null);
    }
  }, []);

  const value = useMemo(
    () => ({ usuario, cargando, iniciarSesion, cerrarSesion }),
    [usuario, cargando, iniciarSesion, cerrarSesion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
};
