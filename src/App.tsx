import { Navigate, Route, Routes } from 'react-router-dom';
import { RutaProtegida } from './auth/RutaProtegida';
import { LayoutAdmin } from './layout/LayoutAdmin';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { KioscoPage } from './pages/kiosco/KioscoPage';

export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/kiosco/:slug" element={<KioscoPage />} />

    <Route element={<RutaProtegida />}>
      <Route element={<LayoutAdmin />}>
        <Route path="/" element={<DashboardPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
