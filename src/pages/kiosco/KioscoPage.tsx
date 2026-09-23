import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { obtenerInfoKiosco } from '../../api/endpoints/kiosco';
import { esApiError } from '../../api/errors';
import type { KioscoInfoDto } from '../../api/tipos';
import { Card } from '../../components/common/Card';
import { Banner } from '../../components/common/Banner';
import { Spinner } from '../../components/common/Spinner';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { FormularioMarcaje } from '../../components/kiosco/FormularioMarcaje';
import styles from './KioscoPage.module.css';

type Estado =
  | { fase: 'cargando' }
  | { fase: 'error'; mensaje: string }
  | { fase: 'listo'; info: KioscoInfoDto };

// Pantalla pública: sin token, pensada para quedar abierta en una PC/tablet en la entrada
export const KioscoPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' });

  useEffect(() => {
    if (!slug) return;
    let cancelado = false;

    obtenerInfoKiosco(slug)
      .then((info) => {
        if (!cancelado) setEstado({ fase: 'listo', info });
      })
      .catch((error) => {
        if (cancelado) return;
        const mensaje = esApiError(error) && error.status === 404
          ? 'Este kiosco no existe o la empresa está desactivada.'
          : 'No se pudo conectar con el servidor. Intente de nuevo.';
        setEstado({ fase: 'error', mensaje });
      });

    return () => {
      cancelado = true;
    };
  }, [slug]);

  return (
    <div className={styles.contenedor}>
      <div className={styles.alternarTema}>
        <ThemeToggle />
      </div>
      <Card className={styles.tarjeta}>
        {estado.fase === 'cargando' && <Spinner />}

        {estado.fase === 'error' && <Banner tipo="error">{estado.mensaje}</Banner>}

        {estado.fase === 'listo' && slug && (
          <>
            <h1 className={styles.titulo}>{estado.info.nombre}</h1>
            <p className={styles.subtitulo}>Registro de asistencia</p>
            <FormularioMarcaje slug={slug} />
          </>
        )}
      </Card>
    </div>
  );
};
