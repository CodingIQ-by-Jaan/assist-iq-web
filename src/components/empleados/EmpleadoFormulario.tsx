import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { EmpresaSelector } from '../empresas/EmpresaSelector';
import { esApiError } from '../../api/errors';
import type { CreateEmpleadoDto, EmpleadoDto, UpdateEmpleadoDto } from '../../api/tipos';
import styles from './EmpleadoFormulario.module.css';

interface Props {
  valorInicial?: EmpleadoDto;
  // Solo el SUPER_ADMIN elige la empresa; ADMIN_EMPRESA siempre crea en la suya (lo resuelve el backend)
  mostrarSelectorEmpresa: boolean;
  empresaIdInicial?: string;
  onGuardar: (dto: CreateEmpleadoDto | UpdateEmpleadoDto) => Promise<void>;
  onCancelar: () => void;
}

export const EmpleadoFormulario = ({
  valorInicial,
  mostrarSelectorEmpresa,
  empresaIdInicial,
  onGuardar,
  onCancelar,
}: Props) => {
  const esEdicion = Boolean(valorInicial);

  const [empresaId, setEmpresaId] = useState<string | undefined>(valorInicial?.empresaId ?? empresaIdInicial);
  const [codigo, setCodigo] = useState(valorInicial?.codigo ?? '');
  const [nombre, setNombre] = useState(valorInicial?.nombre ?? '');
  const [apellido, setApellido] = useState(valorInicial?.apellido ?? '');
  const [identidad, setIdentidad] = useState(valorInicial?.identidad ?? '');
  const [cargo, setCargo] = useState(valorInicial?.cargo ?? '');
  const [activo, setActivo] = useState(valorInicial?.activo ?? true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const alEnviar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!nombre.trim() || !apellido.trim()) {
      setError('Nombre y apellido son obligatorios');
      return;
    }
    if (!esEdicion && mostrarSelectorEmpresa && !empresaId) {
      setError('Selecciona una empresa');
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      if (esEdicion) {
        const dto: UpdateEmpleadoDto = {
          codigo: codigo.trim() || undefined,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          identidad: identidad.trim() || undefined,
          cargo: cargo.trim() || undefined,
          activo,
        };
        await onGuardar(dto);
      } else {
        const dto: CreateEmpleadoDto = {
          empresaId: mostrarSelectorEmpresa ? empresaId : undefined,
          codigo: codigo.trim() || undefined,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          identidad: identidad.trim() || undefined,
          cargo: cargo.trim() || undefined,
        };
        await onGuardar(dto);
      }
    } catch (err) {
      setError(esApiError(err) ? err.message : 'No se pudo guardar el empleado');
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

      <div className={styles.fila}>
        <Input etiqueta="Nombre" name="nombre" value={nombre} onChange={(evento) => setNombre(evento.target.value)} autoFocus required />
        <Input etiqueta="Apellido" name="apellido" value={apellido} onChange={(evento) => setApellido(evento.target.value)} required />
      </div>

      <Input
        etiqueta="Código (opcional)"
        name="codigo"
        value={codigo}
        onChange={(evento) => setCodigo(evento.target.value)}
        placeholder="se genera automáticamente"
      />

      <Input
        etiqueta="Identidad (opcional)"
        name="identidad"
        value={identidad}
        onChange={(evento) => setIdentidad(evento.target.value)}
        placeholder="0801199012345"
      />

      <Input
        etiqueta="Cargo (opcional)"
        name="cargo"
        value={cargo}
        onChange={(evento) => setCargo(evento.target.value)}
        placeholder="Cajera"
      />

      {esEdicion && (
        <label className={styles.casilla}>
          <input type="checkbox" checked={activo} onChange={(evento) => setActivo(evento.target.checked)} />
          Empleado activo
        </label>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.acciones}>
        <Button type="button" variante="secundario" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" cargando={guardando}>
          {esEdicion ? 'Guardar cambios' : 'Crear empleado'}
        </Button>
      </div>
    </form>
  );
};
