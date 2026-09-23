import { peticion } from '../client';
import type {
  CreateEmpresaDto,
  EmpresaDto,
  EmpresasPaginadasDto,
  ListarEmpresasQuery,
  UpdateEmpresaDto,
} from '../tipos';

export const listarEmpresas = (query: ListarEmpresasQuery = {}) =>
  peticion<EmpresasPaginadasDto>('/empresas', { params: query });

export const obtenerEmpresa = (id: string) => peticion<EmpresaDto>(`/empresas/${id}`);

export const crearEmpresa = (dto: CreateEmpresaDto) =>
  peticion<EmpresaDto>('/empresas', { method: 'POST', body: dto });

export const actualizarEmpresa = (id: string, dto: UpdateEmpresaDto) =>
  peticion<EmpresaDto>(`/empresas/${id}`, { method: 'PATCH', body: dto });
