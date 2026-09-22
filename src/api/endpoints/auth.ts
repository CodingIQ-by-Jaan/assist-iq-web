import { peticion } from '../client';
import type { LoginDto, LoginResponseDto, UsuarioDto } from '../tipos';

export const login = (dto: LoginDto) =>
  peticion<LoginResponseDto>('/auth/login', { method: 'POST', body: dto, sinRefresh: true });

export const logout = () => peticion<void>('/auth/logout', { method: 'POST', sinRefresh: true });

// Se usa al montar la app: si la cookie de refresh sigue viva, renueva la sesión sin pedir login
export const refrescar = () =>
  peticion<{ accessToken: string }>('/auth/refresh', { method: 'POST', sinRefresh: true });

export const obtenerPerfil = () => peticion<UsuarioDto>('/auth/me');
