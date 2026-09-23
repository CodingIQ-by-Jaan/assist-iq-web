import type { ReactNode } from 'react';
import { Spinner } from './Spinner';
import styles from './Table.module.css';

export interface ColumnaTabla<T> {
  clave: string;
  encabezado: string;
  render: (fila: T) => ReactNode;
  // Para columnas de acciones o cifras: no tiene sentido que crezcan
  ancho?: string;
}

interface Props<T> {
  columnas: ColumnaTabla<T>[];
  filas: T[];
  obtenerLlave: (fila: T) => string;
  cargando?: boolean;
  vacio?: ReactNode;
}

// Componente genérico: cada módulo (empresas, empleados...) solo define sus columnas.
export const Table = <T,>({ columnas, filas, obtenerLlave, cargando, vacio }: Props<T>) => (
  <div className={styles.contenedor}>
    <table className={styles.tabla}>
      <thead>
        <tr>
          {columnas.map((columna) => (
            <th key={columna.clave} style={columna.ancho ? { width: columna.ancho } : undefined}>
              {columna.encabezado}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {cargando && (
          <tr>
            <td colSpan={columnas.length} className={styles.celdaEstado}>
              <Spinner />
            </td>
          </tr>
        )}

        {!cargando && filas.length === 0 && (
          <tr>
            <td colSpan={columnas.length} className={styles.celdaEstado}>
              {vacio ?? 'No hay registros'}
            </td>
          </tr>
        )}

        {!cargando &&
          filas.map((fila) => (
            <tr key={obtenerLlave(fila)}>
              {columnas.map((columna) => (
                <td key={columna.clave}>{columna.render(fila)}</td>
              ))}
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);
