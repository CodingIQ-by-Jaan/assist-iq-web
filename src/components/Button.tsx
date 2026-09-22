import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';
import styles from './Button.module.css';

type Variante = 'primario' | 'secundario' | 'peligro';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
}

export const Button = ({
  variante = 'primario',
  cargando = false,
  disabled,
  children,
  className,
  ...resto
}: Props) => (
  <button
    className={[styles.boton, styles[variante], className].filter(Boolean).join(' ')}
    disabled={disabled || cargando}
    {...resto}
  >
    {cargando && <Spinner tamano="pequeno" />}
    {children}
  </button>
);
