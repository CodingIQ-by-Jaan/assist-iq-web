import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { EmpresaSelector } from '../empresas/EmpresaSelector';
import { esApiError } from '../../api/errors';
import type { CreateUsuarioAdminDto, UpdateUsuarioAdminDto, UsuarioAdminDto } from '../../api/tipos';
import styles from './AdministradorFormulario.module.css';

interface Props {
  // Si viene, el formulario edita ese administrador; si no, crea uno nuevo
  valorInicial?: UsuarioAdminDto;
  empresaIdInicial?: string;
  onGuardar: (dto: CreateUsuarioAdminDto | UpdateUsuarioAdminDto) => Promise<void>;
  onCancelar: () => void;
}

export const AdministradorFormulario = ({ valorInicial, empresaIdInicial, onGuardar, onCancelar }: Props) => {
  const esEdicion = Boolean(valorInicial);

  const [empresaId, setEmpresaId] = useState<string | undefined>(valorInicial?.empresaId ?? empresaIdInicial);
  const [email, setEmail] = useState(valorInicial?.email ?? '');
  const [nombre, setNombre] = useState(valorInicial?.nombre ?? '');
  const [activo, setActivo] = useState(valorInicial?.activo ?? true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const alEnviar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!esEdicion && (!email.trim() || !empresaId)) {
      setError('Selecciona una empresa e indica el correo');
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      if (esEdicion) {
        const dto: UpdateUsuarioAdminDto = { nombre: nombre.trim(), activo };
        await onGuardar(dto);
      } else {
        const dto: CreateUsuarioAdminDto = {
          empresaId: empresaId as string,
          email: email.trim(),
          nombre: nombre.trim(),
        };
        await onGuardar(dto);
      }
    } catch (err) {
      setError(esApiError(err) ? err.message : 'No se pudo guardar el administrador');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className={styles.formulario} onSubmit={(evento) => void alEnviar(evento)}>
      {!esEdicion && (
        <div className={styles.grupo}>
          <label className={styles.etiqueta} htmlFor="empresaId">
            Empresa
          </label>
          <EmpresaSelector id="empresaId" empresaId={empresaId} onCambiar={setEmpresaId} />
        </div>
      )}

      {!esEdicion && (
        <Input
          etiqueta="Correo"
          name="email"
          type="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          placeholder="admin@empresa.com"
          required
        />
      )}

      <Input
        etiqueta="Nombre"
        name="nombre"
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
        autoFocus
        required
      />

      {esEdicion && (
        <label className={styles.casilla}>
          <input type="checkbox" checked={activo} onChange={(evento) => setActivo(evento.target.checked)} />
          Administrador activo
        </label>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.acciones}>
        <Button type="button" variante="secundario" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" cargando={guardando}>
          {esEdicion ? 'Guardar cambios' : 'Crear administrador'}
        </Button>
      </div>
    </form>
  );
};
