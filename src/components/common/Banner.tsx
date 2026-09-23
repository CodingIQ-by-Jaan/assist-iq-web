import type { ReactNode } from 'react';
import styles from './Banner.module.css';

type Tipo = 'error' | 'exito' | 'info';

export const Banner = ({ tipo = 'info', children }: { tipo?: Tipo; children: ReactNode }) => (
  <div className={[styles.banner, styles[tipo]].join(' ')} role={tipo === 'error' ? 'alert' : 'status'}>
    {children}
  </div>
);
