import type { TipoMarcaje } from '../../api/tipos';

// Mismo texto que ETIQUETAS en assistiq-api/src/marcajes/secuencia.ts: si cambia allá, cambia aquí
export const ETIQUETAS_MARCAJE: Record<TipoMarcaje, string> = {
  ENTRADA: 'Entrada',
  INICIO_ALMUERZO: 'Inicio de almuerzo',
  FIN_ALMUERZO: 'Fin de almuerzo',
  SALIDA: 'Salida',
};
