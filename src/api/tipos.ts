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
