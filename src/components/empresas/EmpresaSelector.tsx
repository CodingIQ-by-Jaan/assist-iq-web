import { useEffect, useState } from 'react';
import { listarEmpresas } from '../../api/endpoints/empresas';
import type { EmpresaDto } from '../../api/tipos';
import styles from './EmpresaSelector.module.css';

interface Props {
  empresaId: string | undefined;
  onCambiar: (empresaId: string | undefined) => void;
  // Agrega la opción "Todas las empresas" (la usa el listado de empleados del SUPER_ADMIN)
  incluirTodas?: boolean;
  className?: string;
  // Para asociarlo con un <label htmlFor> cuando se usa dentro de un formulario
  id?: string;
}

// Selector reutilizable de empresa: hoy lo usa el listado de empleados (SUPER_ADMIN filtra por empresa),
// y cualquier otra pantalla futura que necesite elegir una empresa lo reutiliza en vez de duplicarlo.
export const EmpresaSelector = ({ empresaId, onCambiar, incluirTodas = false, className, id }: Props) => {
  const [empresas, setEmpresas] = useState<EmpresaDto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    listarEmpresas({ limit: 100, activa: true })
      .then((respuesta) => {
        if (!cancelado) setEmpresas(respuesta.data);
      })
      .catch(() => {
        if (!cancelado) setEmpresas([]);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <select
      id={id}
      className={[styles.selector, className].filter(Boolean).join(' ')}
      value={empresaId ?? ''}
      disabled={cargando}
      onChange={(evento) => onCambiar(evento.target.value || undefined)}
    >
      {incluirTodas && <option value="">Todas las empresas</option>}
      {!incluirTodas && !empresaId && <option value="">Selecciona una empresa</option>}
      {empresas.map((empresa) => (
        <option key={empresa.id} value={empresa.id}>
          {empresa.nombre}
        </option>
      ))}
    </select>
  );
};
