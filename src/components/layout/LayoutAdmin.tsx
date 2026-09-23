import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../common/Button';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import styles from './LayoutAdmin.module.css';

// "Empresas" y "Administradores" solo las ve el SUPER_ADMIN (gestión global);
// "Empleados" la ven ambos roles (el ADMIN_EMPRESA queda acotado a su propia empresa por el backend)
const enlacesPara = (esSuperAdmin: boolean) => [
  { a: '/', etiqueta: 'Inicio' },
  ...(esSuperAdmin ? [{ a: '/empresas', etiqueta: 'Empresas' }] : []),
  ...(esSuperAdmin ? [{ a: '/administradores', etiqueta: 'Administradores' }] : []),
  { a: '/empleados', etiqueta: 'Empleados' },
];

export const LayoutAdmin = () => {
  const { usuario, cerrarSesion } = useAuth();
  const enlaces = enlacesPara(usuario?.rol === 'SUPER_ADMIN');

  return (
    <div className={styles.layout}>
      <aside className={styles.barraLateral}>
        <div className={styles.marca}>
          <Logo tamanoIcono={26} />
        </div>
        <nav className={styles.nav}>
          {enlaces.map(({ a, etiqueta }) => (
            <NavLink
              key={a}
              to={a}
              end={a === '/'}
              className={({ isActive }) => [styles.enlace, isActive && styles.enlaceActivo].filter(Boolean).join(' ')}
            >
              {etiqueta}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.contenido}>
        <header className={styles.encabezado}>
          <ThemeToggle />
          <span className={styles.nombreUsuario}>{usuario?.nombre}</span>
          <Button variante="secundario" onClick={() => void cerrarSesion()}>
            Cerrar sesión
          </Button>
        </header>

        <main className={styles.principal}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
