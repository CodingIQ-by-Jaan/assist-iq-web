import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string;
  error?: string;
}

// forwardRef porque react-hook-form (fase 2) y el autofocus del kiosco lo necesitan
export const Input = forwardRef<HTMLInputElement, Props>(
  ({ etiqueta, error, id, className, ...resto }, ref) => {
    const inputId = id ?? resto.name;
    return (
      <div className={styles.grupo}>
        {etiqueta && (
          <label className={styles.etiqueta} htmlFor={inputId}>
            {etiqueta}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[styles.input, error && styles.conError, className].filter(Boolean).join(' ')}
          aria-invalid={Boolean(error)}
          {...resto}
        />
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';
