import { useTheme } from '../../theme/ThemeContext';
import styles from './ThemeToggle.module.css';

// Ícono muestra el tema al que se cambiará al hacer clic (sol = ir a claro, luna = ir a oscuro)
export const ThemeToggle = () => {
  const { tema, alternarTema } = useTheme();
  const esOscuro = tema === 'oscuro';
  const etiqueta = esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';

  return (
    <button type="button" className={styles.boton} onClick={alternarTema} aria-label={etiqueta} title={etiqueta}>
      {esOscuro ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        </svg>
      )}
    </button>
  );
};
