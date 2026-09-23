import type { components } from './schema';

export type Schemas = components['schemas'];

export type LoginDto = Schemas['LoginDto'];
export type LoginResponseDto = Schemas['LoginResponseDto'];
export type UsuarioDto = Schemas['UsuarioDto'];
export type Rol = UsuarioDto['rol'];

export type KioscoInfoDto = Schemas['KioscoInfoDto'];
export type CredencialesKioscoDto = Schemas['CredencialesKioscoDto'];
export type EstadoKioscoDto = Schemas['EstadoKioscoDto'];
export type MarcarDto = Schemas['MarcarDto'];
export type MarcarRespuestaDto = Schemas['MarcarRespuestaDto'];
export type TipoMarcaje = MarcarDto['tipo'];

export type EmpresaDto = Schemas['EmpresaDto'];
export type EmpresasPaginadasDto = Schemas['EmpresasPaginadasDto'];
export type CreateEmpresaDto = Schemas['CreateEmpresaDto'];
export type UpdateEmpresaDto = Schemas['UpdateEmpresaDto'];

export interface ListarEmpresasQuery {
  page?: number;
  limit?: number;
  search?: string;
  activa?: boolean;
  [clave: string]: string | number | boolean | undefined;
}

export type EmpleadoDto = Schemas['EmpleadoDto'];
export type EmpleadosPaginadosDto = Schemas['EmpleadosPaginadosDto'];
export type CreateEmpleadoDto = Schemas['CreateEmpleadoDto'];
export type UpdateEmpleadoDto = Schemas['UpdateEmpleadoDto'];
export type EmpleadoCreadoDto = Schemas['EmpleadoCreadoDto'];
export type ResetPinDto = Schemas['ResetPinDto'];
export type PinRestablecidoDto = Schemas['PinRestablecidoDto'];

export interface ListarEmpleadosQuery {
  page?: number;
  limit?: number;
  empresaId?: string;
  search?: string;
  activo?: boolean;
  [clave: string]: string | number | boolean | undefined;
}

export type UsuarioAdminDto = Schemas['UsuarioAdminDto'];
export type UsuariosAdminPaginadosDto = Schemas['UsuariosAdminPaginadosDto'];
export type CreateUsuarioAdminDto = Schemas['CreateUsuarioAdminDto'];
export type UpdateUsuarioAdminDto = Schemas['UpdateUsuarioAdminDto'];
export type UsuarioAdminCreadoDto = Schemas['UsuarioAdminCreadoDto'];
export type ResetPasswordUsuarioAdminDto = Schemas['ResetPasswordUsuarioAdminDto'];
export type PasswordRestablecidaDto = Schemas['PasswordRestablecidaDto'];

export interface ListarUsuariosAdminQuery {
  page?: number;
  limit?: number;
  empresaId?: string;
  search?: string;
  [clave: string]: string | number | boolean | undefined;
}
