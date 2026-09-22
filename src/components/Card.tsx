import type { HTMLAttributes } from 'react';
import styles from './Card.module.css';

export const Card = ({ className, ...resto }: HTMLAttributes<HTMLDivElement>) => (
  <div className={[styles.tarjeta, className].filter(Boolean).join(' ')} {...resto} />
);
