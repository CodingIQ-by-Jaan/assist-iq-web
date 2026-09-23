import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { Rol } from '../api/tipos';

interface Props {
  roles: Rol[];
}

// Se usa dentro de <RutaProtegida>: aquí ya hay sesión, solo falta validar el rol.
// Si el usuario no tiene el rol requerido, lo manda al inicio en vez de mostrar la pantalla.
export const RutaConRol = ({ roles }: Props) => {
  const { usuario } = useAuth();

  if (!usuario || !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
