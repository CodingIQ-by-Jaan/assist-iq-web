import type { InputHTMLAttributes } from 'react';
import styles from './SearchInput.module.css';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onLimpiar?: () => void;
}

// El debounce va afuera (useDebouncedValue): este componente solo se ve y limpia
export const SearchInput = ({ value, onLimpiar, className, ...resto }: Props) => (
  <div className={[styles.contenedor, className].filter(Boolean).join(' ')}>
    <span className={styles.icono} aria-hidden>
      ⌕
    </span>
    <input type="search" className={styles.input} value={value} {...resto} />
    {onLimpiar && typeof value === 'string' && value.length > 0 && (
      <button type="button" className={styles.limpiar} onClick={onLimpiar} aria-label="Limpiar búsqueda">
        ×
      </button>
    )}
  </div>
);
