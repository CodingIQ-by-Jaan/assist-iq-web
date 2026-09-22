import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import styles from './LayoutAdmin.module.css';

// Cada entrada se agrega a medida que exista su pantalla (fases siguientes)
const ENLACES = [{ a: '/', etiqueta: 'Inicio' }];

export const LayoutAdmin = () => {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <div className={styles.layout}>
      <aside className={styles.barraLateral}>
        <div className={styles.marca}>AssistIQ</div>
        <nav className={styles.nav}>
          {ENLACES.map(({ a, etiqueta }) => (
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
