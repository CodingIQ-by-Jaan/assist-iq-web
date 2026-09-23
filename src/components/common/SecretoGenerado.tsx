import { useState } from 'react';
import { Button } from './Button';
import styles from './SecretoGenerado.module.css';

interface Props {
  valor: string;
  aviso?: string;
  onCerrar: () => void;
}

// Para cualquier secreto que el backend solo devuelve una vez en texto plano (PIN de empleado,
// contraseña de administrador, etc.): lo muestra en grande y ofrece copiarlo antes de cerrar.
export const SecretoGenerado = ({
  valor,
  aviso = 'Esto solo se muestra una vez. Guárdalo ahora.',
  onCerrar,
}: Props) => {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className={styles.contenedor}>
      <p className={styles.aviso}>{aviso}</p>
      <div className={styles.valor}>{valor}</div>
      <div className={styles.acciones}>
        <Button type="button" variante="secundario" onClick={() => void copiar()}>
          {copiado ? 'Copiado' : 'Copiar'}
        </Button>
        <Button type="button" onClick={onCerrar}>
          Listo
        </Button>
      </div>
    </div>
  );
};
