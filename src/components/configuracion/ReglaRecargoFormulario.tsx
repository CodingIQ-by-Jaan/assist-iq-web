import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { EmpresaSelector } from '../empresas/EmpresaSelector';
import { esApiError } from '../../api/errors';
import type { CreateReglaRecargoDto, ReglaRecargoDto, UpdateReglaRecargoDto } from '../../api/tipos';
import styles from './ReglaRecargoFormulario.module.css';

interface Props {
  // Si viene, el formulario edita esa regla; si no, crea una nueva
  valorInicial?: ReglaRecargoDto;
  // Solo el SUPER_ADMIN elige la empresa; ADMIN_EMPRESA siempre crea en la suya (lo resuelve el backend)
  mostrarSelectorEmpresa: boolean;
  empresaIdInicial?: string;
  onGuardar: (dto: CreateReglaRecargoDto | UpdateReglaRecargoDto) => Promise<void>;
  onCancelar: () => void;
}

export const ReglaRecargoFormulario = ({
  valorInicial,
  mostrarSelectorEmpresa,
  empresaIdInicial,
  onGuardar,
  onCancelar,
}: Props) => {
  const esEdicion = Boolean(valorInicial);

  const [empresaId, setEmpresaId] = useState<string | undefined>(empresaIdInicial);
  const [nombre, setNombre] = useState(valorInicial?.nombre ?? '');
  const [horaInicio, setHoraInicio] = useState(valorInicial?.horaInicio ?? '20:00');
  const [horaFin, setHoraFin] = useState(valorInicial?.horaFin ?? '04:00');
  const [porcentajeTexto, setPorcentajeTexto] = useState(
    valorInicial ? String(valorInicial.porcentaje) : '',
  );
  const [activa, setActiva] = useState(valorInicial?.activa ?? true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const alEnviar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!esEdicion && mostrarSelectorEmpresa && !empresaId) {
      setError('Selecciona una empresa');
      return;
    }
    if (!horaInicio || !horaFin) {
      setError('Indica la hora de inicio y de fin de la franja');
      return;
    }
    if (horaInicio === horaFin) {
      setError('La hora de inicio y de fin no pueden ser iguales');
      return;
    }
    if (porcentajeTexto.trim() === '') {
      setError('Indica el porcentaje extra de esta regla');
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      if (esEdicion) {
        const dto: UpdateReglaRecargoDto = {
          nombre: nombre.trim(),
          horaInicio,
          horaFin,
          porcentaje: Number(porcentajeTexto),
          activa,
        };
        await onGuardar(dto);
      } else {
        const dto: CreateReglaRecargoDto = {
          empresaId: mostrarSelectorEmpresa ? empresaId : undefined,
          nombre: nombre.trim(),
          horaInicio,
          horaFin,
          porcentaje: Number(porcentajeTexto),
        };
        await onGuardar(dto);
      }
    } catch (err) {
      setError(esApiError(err) ? err.message : 'No se pudo guardar la regla');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className={styles.formulario} onSubmit={(evento) => void alEnviar(evento)}>
      {!esEdicion && mostrarSelectorEmpresa && (
        <div className={styles.grupo}>
          <label className={styles.etiqueta} htmlFor="empresaId">
            Empresa
          </label>
          <EmpresaSelector id="empresaId" empresaId={empresaId} onCambiar={setEmpresaId} />
        </div>
      )}

      <Input
        etiqueta="Nombre"
        name="nombre"
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
        placeholder="Nocturnidad"
        autoFocus
        required
      />

      <div className={styles.fila}>
        <Input
          etiqueta="Hora de inicio"
          name="horaInicio"
          type="time"
          value={horaInicio}
          onChange={(evento) => setHoraInicio(evento.target.value)}
          required
        />
        <Input
          etiqueta="Hora de fin"
          name="horaFin"
          type="time"
          value={horaFin}
          onChange={(evento) => setHoraFin(evento.target.value)}
          required
        />
      </div>
      <p className={styles.ayuda}>
        Si la hora de fin es menor que la de inicio, la franja cruza la medianoche (ej. 20:00 a 04:00).
      </p>

      <Input
        etiqueta="Porcentaje extra"
        name="porcentaje"
        type="number"
        min={0}
        max={500}
        step="0.01"
        value={porcentajeTexto}
        onChange={(evento) => setPorcentajeTexto(evento.target.value)}
        placeholder="25"
        required
      />

      {esEdicion && (
        <label className={styles.casilla}>
          <input type="checkbox" checked={activa} onChange={(evento) => setActiva(evento.target.checked)} />
          Regla activa
        </label>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.acciones}>
        <Button type="button" variante="secundario" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" cargando={guardando}>
          {esEdicion ? 'Guardar cambios' : 'Crear regla'}
        </Button>
      </div>
    </form>
  );
};
