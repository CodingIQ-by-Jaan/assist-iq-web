import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface Props {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export const PageHeader = ({ titulo, descripcion, accion }: Props) => (
  <div className={styles.encabezado}>
    <div>
      <h1 className={styles.titulo}>{titulo}</h1>
      {descripcion && <p className={styles.descripcion}>{descripcion}</p>}
    </div>
    {accion && <div>{accion}</div>}
  </div>
);
