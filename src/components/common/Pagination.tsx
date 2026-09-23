import { Button } from './Button';
import styles from './Pagination.module.css';

interface Props {
  pagina: number;
  totalPaginas: number;
  total: number;
  onCambiar: (pagina: number) => void;
}

export const Pagination = ({ pagina, totalPaginas, total, onCambiar }: Props) => {
  if (total === 0) return null;

  return (
    <div className={styles.contenedor}>
      <span className={styles.info}>
        Página {pagina} de {totalPaginas} · {total} {total === 1 ? 'registro' : 'registros'}
      </span>
      <div className={styles.botones}>
        <Button
          type="button"
          variante="secundario"
          disabled={pagina <= 1}
          onClick={() => onCambiar(pagina - 1)}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variante="secundario"
          disabled={pagina >= totalPaginas}
          onClick={() => onCambiar(pagina + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};
