// El accessToken vive solo en memoria (nunca en localStorage/sessionStorage): así un XSS
// no puede robarlo leyendo el storage, y se pierde al recargar la página (por eso el
// AuthProvider intenta un refresh silencioso al montar, usando la cookie httpOnly).
let accessToken: string | null = null;

export const obtenerToken = () => accessToken;
export const guardarToken = (token: string | null) => {
  accessToken = token;
};
