// Vite valida en build time que exista; en dev, Vite falla rápido si falta el .env
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');

if (!API_URL) {
  throw new Error('Falta la variable de entorno VITE_API_URL (revisa tu .env)');
}
