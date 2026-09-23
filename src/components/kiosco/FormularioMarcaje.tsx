import { useState } from 'react';
import type { FormEvent } from 'react';
import { consultarEstado, marcar } from '../../api/endpoints/kiosco';
import { esApiError } from '../../api/errors';
import type { EstadoKioscoDto, MarcarRespuestaDto, TipoMarcaje } from '../../api/tipos';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Banner } from '../common/Banner';
import { ETIQUETAS_MARCAJE } from './etiquetas';
import styles from './FormularioMarcaje.module.css';

type Paso =
  | { tipo: 'credenciales' }
  | { tipo: 'confirmar'; estado: EstadoKioscoDto }
  | { tipo: 'confirmado'; resultado: MarcarRespuestaDto };

const CODIGO_INICIAL = { codigo: '', pin: '' };

export const FormularioMarcaje = ({ slug }: { slug: string }) => {
  const [paso, setPaso] = useState<Paso>({ tipo: 'credenciales' });
  const [credenciales, setCredenciales] = useState(CODIGO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reiniciar = () => {
    setPaso({ tipo: 'credenciales' });
    setCredenciales(CODIGO_INICIAL);
    setError(null);
  };

  const consultar = async (evento: FormEvent) => {
    evento.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const estado = await consultarEstado(slug, credenciales);
      setPaso({ tipo: 'confirmar', estado });
    } catch (err) {
      setError(esApiError(err) ? err.message : 'No se pudo validar. Intente de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const registrarMarcaje = async (tipo: TipoMarcaje) => {
    setError(null);
    setEnviando(true);
    try {
      const resultado = await marcar(slug, { ...credenciales, tipo });
      setPaso({ tipo: 'confirmado', resultado });
    } catch (err) {
      setError(esApiError(err) ? err.message : 'No se pudo registrar el marcaje. Intente de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (paso.tipo === 'confirmado') {
    const { tipo, marcadoEn, empleado } = paso.resultado;
    const hora = new Date(marcadoEn).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' });
    return (
      <div className={styles.confirmacion}>
        <Banner tipo="exito">
          {empleado.nombre}, se registró tu {ETIQUETAS_MARCAJE[tipo].toLowerCase()} a las {hora}.
        </Banner>
        <Button onClick={reiniciar}>Marcar otro empleado</Button>
      </div>
    );
  }

  if (paso.tipo === 'confirmar') {
    const { empleado, permitidos } = paso.estado;
    return (
      <div className={styles.confirmar}>
        <p className={styles.saludo}>
          Hola, <strong>{empleado.nombre} {empleado.apellido}</strong>
        </p>

        {error && <Banner tipo="error">{error}</Banner>}

        <div className={styles.botonesMarcaje}>
          {permitidos.map((tipo) => (
            <Button key={tipo} cargando={enviando} onClick={() => void registrarMarcaje(tipo)}>
              {ETIQUETAS_MARCAJE[tipo]}
            </Button>
          ))}
        </div>

        <Button variante="secundario" disabled={enviando} onClick={reiniciar}>
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <form className={styles.formulario} onSubmit={(e) => void consultar(e)}>
      {error && <Banner tipo="error">{error}</Banner>}

      <Input
        etiqueta="Código de empleado"
        name="codigo"
        autoFocus
        required
        value={credenciales.codigo}
        onChange={(e) => setCredenciales({ ...credenciales, codigo: e.target.value })}
      />
      <Input
        etiqueta="PIN"
        name="pin"
        type="password"
        inputMode="numeric"
        maxLength={6}
        required
        value={credenciales.pin}
        onChange={(e) => setCredenciales({ ...credenciales, pin: e.target.value })}
      />

      <Button type="submit" cargando={enviando}>
        Continuar
      </Button>
    </form>
  );
};
