import { Navigate, Route, Routes } from 'react-router-dom';
import { RutaProtegida } from './auth/RutaProtegida';
import { RutaConRol } from './auth/RutaConRol';
import { ThemeProvider } from './theme/ThemeContext';
import { LayoutAdmin } from './components/layout/LayoutAdmin';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { EmpresasPage } from './pages/empresas/EmpresasPage';
import { EmpleadosPage } from './pages/empleados/EmpleadosPage';
import { AdministradoresPage } from './pages/administradores/AdministradoresPage';
import { KioscoPage } from './pages/kiosco/KioscoPage';

export const App = () => (
  <ThemeProvider>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/kiosco/:slug" element={<KioscoPage />} />

      <Route element={<RutaProtegida />}>
        <Route element={<LayoutAdmin />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/empleados" element={<EmpleadosPage />} />

          {/* Solo SUPER_ADMIN: gestión global de empresas y sus administradores */}
          <Route element={<RutaConRol roles={['SUPER_ADMIN']} />}>
            <Route path="/empresas" element={<EmpresasPage />} />
            <Route path="/administradores" element={<AdministradoresPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </ThemeProvider>
);
