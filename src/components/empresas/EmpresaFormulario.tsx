import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { esApiError } from '../../api/errors';
import type { CreateEmpresaDto, EmpresaDto, UpdateEmpresaDto } from '../../api/tipos';
import styles from './EmpresaFormulario.module.css';

interface Props {
  // Si viene, el formulario edita esa empresa; si no, crea una nueva
  valorInicial?: EmpresaDto;
  onGuardar: (dto: CreateEmpresaDto | UpdateEmpresaDto) => Promise<void>;
  onCancelar: () => void;
}

const ZONA_HORARIA_DEFECTO = 'America/Tegucigalpa';

export const EmpresaFormulario = ({ valorInicial, onGuardar, onCancelar }: Props) => {
  const esEdicion = Boolean(valorInicial);

  const [nombre, setNombre] = useState(valorInicial?.nombre ?? '');
  const [slug, setSlug] = useState(valorInicial?.slug ?? '');
  const [rtn, setRtn] = useState(valorInicial?.rtn ?? '');
  const [zonaHoraria, setZonaHoraria] = useState(valorInicial?.zonaHoraria ?? ZONA_HORARIA_DEFECTO);
  const [limiteEmpleadosTexto, setLimiteEmpleadosTexto] = useState(
    valorInicial?.limiteEmpleados != null ? String(valorInicial.limiteEmpleados) : '',
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

    setError(null);
    setGuardando(true);
    try {
      const dto: CreateEmpresaDto | UpdateEmpresaDto = {
        nombre: nombre.trim(),
        slug: slug.trim() || undefined,
        rtn: rtn.trim() || undefined,
        zonaHoraria: zonaHoraria.trim() || ZONA_HORARIA_DEFECTO,
        limiteEmpleados: limiteEmpleadosTexto.trim() === '' ? null : Number(limiteEmpleadosTexto),
        ...(esEdicion && { activa }),
      };
      await onGuardar(dto);
    } catch (err) {
      setError(esApiError(err) ? err.message : 'No se pudo guardar la empresa');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className={styles.formulario} onSubmit={(evento) => void alEnviar(evento)}>
      <Input
        etiqueta="Nombre"
        name="nombre"
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
        placeholder="Pizzería El Sol"
        autoFocus
        required
      />

      <Input
        etiqueta="Slug (opcional)"
        name="slug"
        value={slug}
        onChange={(evento) => setSlug(evento.target.value)}
        placeholder="se genera desde el nombre"
      />

      <Input
        etiqueta="RTN (opcional)"
        name="rtn"
        value={rtn}
        onChange={(evento) => setRtn(evento.target.value)}
        placeholder="08019999123456"
      />

      <Input
        etiqueta="Zona horaria"
        name="zonaHoraria"
        value={zonaHoraria}
        onChange={(evento) => setZonaHoraria(evento.target.value)}
        required
      />

      <Input
        etiqueta="Límite de empleados (opcional)"
        name="limiteEmpleados"
        type="number"
        min={0}
        step={1}
        value={limiteEmpleadosTexto}
        onChange={(evento) => setLimiteEmpleadosTexto(evento.target.value)}
        placeholder="Sin límite"
      />

      {esEdicion && (
        <label className={styles.casilla}>
          <input type="checkbox" checked={activa} onChange={(evento) => setActiva(evento.target.checked)} />
          Empresa activa
        </label>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.acciones}>
        <Button type="button" variante="secundario" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" cargando={guardando}>
          {esEdicion ? 'Guardar cambios' : 'Crear empresa'}
        </Button>
      </div>
    </form>
  );
};
