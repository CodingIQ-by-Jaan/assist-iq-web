import { peticion, peticionArchivo } from '../client';
import type { GenerarReporteQuery, ReporteHorasDto } from '../tipos';

export const generarReporteHoras = (query: GenerarReporteQuery) =>
  peticion<ReporteHorasDto>('/reportes/horas', { params: query });

export const descargarReporteHorasPdf = (query: GenerarReporteQuery) =>
  peticionArchivo('/reportes/horas/pdf', { params: query });
