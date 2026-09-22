import { peticion } from '../client';
import type {
  CredencialesKioscoDto,
  EstadoKioscoDto,
  KioscoInfoDto,
  MarcarDto,
  MarcarRespuestaDto,
} from '../tipos';

// Endpoints públicos: nunca llevan Authorization ni disparan el refresh de sesión admin
const OPCIONES_PUBLICAS = { sinRefresh: true } as const;

export const obtenerInfoKiosco = (slug: string) =>
  peticion<KioscoInfoDto>(`/public/kiosco/${encodeURIComponent(slug)}`, OPCIONES_PUBLICAS);

export const consultarEstado = (slug: string, credenciales: CredencialesKioscoDto) =>
  peticion<EstadoKioscoDto>(`/public/kiosco/${encodeURIComponent(slug)}/estado`, {
    ...OPCIONES_PUBLICAS,
    method: 'POST',
    body: credenciales,
  });

export const marcar = (slug: string, dto: MarcarDto) =>
  peticion<MarcarRespuestaDto>(`/public/kiosco/${encodeURIComponent(slug)}/marcajes`, {
    ...OPCIONES_PUBLICAS,
    method: 'POST',
    body: dto,
  });
