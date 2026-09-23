import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/common/Card';

// Placeholder de la fase 1: las tarjetas de empresas/empleados llegan en la fase 2
export const DashboardPage = () => {
  const { usuario } = useAuth();

  return (
    <div>
      <h1>Bienvenido, {usuario?.nombre}</h1>
      <Card style={{ marginTop: 16 }}>
        <p>El panel de empresas, empleados y marcajes se agrega en la siguiente fase.</p>
      </Card>
    </div>
  );
};
