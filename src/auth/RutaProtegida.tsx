import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Spinner } from '../components/Spinner';

export const RutaProtegida = () => {
  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();

  if (cargando) return <Spinner pantallaCompleta />;

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }

  return <Outlet />;
};
