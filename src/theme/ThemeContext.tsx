import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Tema = 'oscuro' | 'claro';

const CLAVE_ALMACENAMIENTO = 'assistiq:tema';

interface ThemeContextValue {
  tema: Tema;
  alternarTema: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Solo lee la preferencia guardada por el usuario: nunca detecta el tema del sistema operativo/navegador
const leerTemaGuardado = (): Tema => {
  try {
    return localStorage.getItem(CLAVE_ALMACENAMIENTO) === 'claro' ? 'claro' : 'oscuro';
  } catch {
    return 'oscuro';
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [tema, setTema] = useState<Tema>(leerTemaGuardado);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, tema);
    } catch {
      // Almacenamiento no disponible (modo privado, etc.): el tema solo dura la sesión actual
    }
  }, [tema]);

  const alternarTema = useCallback(() => {
    setTema((actual) => (actual === 'oscuro' ? 'claro' : 'oscuro'));
  }, []);

  const value = useMemo(() => ({ tema, alternarTema }), [tema, alternarTema]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const contexto = useContext(ThemeContext);
  if (!contexto) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return contexto;
};
