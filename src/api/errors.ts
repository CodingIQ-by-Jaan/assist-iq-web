// Forma estándar de los errores que devuelve Nest (ValidationPipe, HttpException, filtros)
export interface CuerpoErrorApi {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly detalles?: string[];

  constructor(status: number, cuerpo: Partial<CuerpoErrorApi> | undefined) {
    const mensaje = Array.isArray(cuerpo?.message)
      ? cuerpo!.message.join(' ')
      : (cuerpo?.message ?? `Error inesperado (${status})`);
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.detalles = Array.isArray(cuerpo?.message) ? cuerpo!.message : undefined;
  }
}

export const esApiError = (error: unknown): error is ApiError => error instanceof ApiError;
