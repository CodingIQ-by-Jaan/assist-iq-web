import { useEffect, useState } from 'react';

// Útil para no disparar una petición al API en cada tecla de un buscador
export const useDebouncedValue = <T>(valor: T, esperaMs = 350): T => {
  const [valorDiferido, setValorDiferido] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setValorDiferido(valor), esperaMs);
    return () => clearTimeout(temporizador);
  }, [valor, esperaMs]);

  return valorDiferido;
};
