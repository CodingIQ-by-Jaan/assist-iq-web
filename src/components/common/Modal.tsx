import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

interface Props {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: 'normal' | 'angosto';
}

export const Modal = ({ abierto, titulo, onCerrar, children, ancho = 'normal' }: Props) => {
  // Cerrar con Escape, y bloquear el scroll del fondo mientras el modal está abierto
  useEffect(() => {
    if (!abierto) return;

    const alTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alTecla);

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', alTecla);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return createPortal(
    <div className={styles.fondo} onMouseDown={onCerrar}>
      <div
        className={[styles.dialogo, ancho === 'angosto' && styles.angosto].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.encabezado}>
          <h2 className={styles.titulo}>{titulo}</h2>
          <button type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </div>
        <div className={styles.cuerpo}>{children}</div>
      </div>
    </div>,
    document.body,
  );
};
