import { peticion } from '../client';
import type {
  CreateUsuarioAdminDto,
  ListarUsuariosAdminQuery,
  PasswordRestablecidaDto,
  ResetPasswordUsuarioAdminDto,
  UpdateUsuarioAdminDto,
  UsuarioAdminCreadoDto,
  UsuarioAdminDto,
  UsuariosAdminPaginadosDto,
} from '../tipos';

export const listarUsuariosAdmin = (query: ListarUsuariosAdminQuery = {}) =>
  peticion<UsuariosAdminPaginadosDto>('/usuarios-admin', { params: query });

export const crearUsuarioAdmin = (dto: CreateUsuarioAdminDto) =>
  peticion<UsuarioAdminCreadoDto>('/usuarios-admin', { method: 'POST', body: dto });

export const actualizarUsuarioAdmin = (id: string, dto: UpdateUsuarioAdminDto) =>
  peticion<UsuarioAdminDto>(`/usuarios-admin/${id}`, { method: 'PATCH', body: dto });

export const restablecerPasswordUsuarioAdmin = (id: string, dto: ResetPasswordUsuarioAdminDto = {}) =>
  peticion<PasswordRestablecidaDto>(`/usuarios-admin/${id}/reset-password`, { method: 'POST', body: dto });
