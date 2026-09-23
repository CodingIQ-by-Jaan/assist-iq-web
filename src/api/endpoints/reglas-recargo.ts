import { peticion } from '../client';
import type { CreateReglaRecargoDto, ListarReglasRecargoQuery, ReglaRecargoDto, UpdateReglaRecargoDto } from '../tipos';

export const listarReglasRecargo = (query: ListarReglasRecargoQuery = {}) =>
  peticion<ReglaRecargoDto[]>('/reglas-recargo', { params: query });

export const crearReglaRecargo = (dto: CreateReglaRecargoDto) =>
  peticion<ReglaRecargoDto>('/reglas-recargo', { method: 'POST', body: dto });

export const actualizarReglaRecargo = (id: string, dto: UpdateReglaRecargoDto) =>
  peticion<ReglaRecargoDto>(`/reglas-recargo/${id}`, { method: 'PATCH', body: dto });
