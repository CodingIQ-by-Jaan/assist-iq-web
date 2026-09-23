import { peticion } from '../client';
import type {
  CreateEmpleadoDto,
  EmpleadoCreadoDto,
  EmpleadoDto,
  EmpleadosPaginadosDto,
  ListarEmpleadosQuery,
  PinRestablecidoDto,
  ResetPinDto,
  UpdateEmpleadoDto,
} from '../tipos';

export const listarEmpleados = (query: ListarEmpleadosQuery = {}) =>
  peticion<EmpleadosPaginadosDto>('/empleados', { params: query });

export const obtenerEmpleado = (id: string) => peticion<EmpleadoDto>(`/empleados/${id}`);

export const crearEmpleado = (dto: CreateEmpleadoDto) =>
  peticion<EmpleadoCreadoDto>('/empleados', { method: 'POST', body: dto });

export const actualizarEmpleado = (id: string, dto: UpdateEmpleadoDto) =>
  peticion<EmpleadoDto>(`/empleados/${id}`, { method: 'PATCH', body: dto });

export const restablecerPin = (id: string, dto: ResetPinDto = {}) =>
  peticion<PinRestablecidoDto>(`/empleados/${id}/reset-pin`, { method: 'POST', body: dto });
