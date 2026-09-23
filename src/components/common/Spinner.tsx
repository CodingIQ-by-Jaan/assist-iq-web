import styles from './Spinner.module.css';

interface Props {
  tamano?: 'pequeno' | 'normal';
  pantallaCompleta?: boolean;
}

export const Spinner = ({ tamano = 'normal', pantallaCompleta = false }: Props) => {
  const spinner = <span className={[styles.spinner, styles[tamano]].join(' ')} role="status" aria-label="Cargando" />;

  if (!pantallaCompleta) return spinner;

  return <div className={styles.contenedorCompleto}>{spinner}</div>;
};
