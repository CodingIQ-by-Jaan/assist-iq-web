import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type Tono = 'exito' | 'peligro' | 'neutro';

export const Badge = ({ tono = 'neutro', children }: { tono?: Tono; children: ReactNode }) => (
  <span className={[styles.badge, styles[tono]].join(' ')}>{children}</span>
);
