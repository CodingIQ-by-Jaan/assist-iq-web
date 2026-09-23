import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Table } from '../../components/common/Table';
import type { ColumnaTabla } from '../../components/common/Table';
import { EmpresaSelector } from '../../components/empresas/EmpresaSelector';
import { descargarReporteHorasPdf, generarReporteHoras } from '../../api/endpoints/reportes';
import { esApiError } from '../../api/errors';
import type { EmpleadoReporteDto, ReporteHorasDto } from '../../api/tipos';
import styles from './ReportesPage.module.css';

const aIso = (fecha: Date) => fecha.toISOString().slice(0, 10);
const hoyIso = () => aIso(new Date());
const haceDiasIso = (dias: number) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return aIso(fecha);
};

const formatoLempiras = (valor: number | null) => (valor === null ? '—' : `L ${valor.toFixed(2)}`);

export const ReportesPage = () => {
  const { usuario } = useAuth();
  const esSuperAdmin = usuario?.rol === 'SUPER_ADMIN';

  // ADMIN_EMPRESA no elige empresa: el backend la resuelve a la suya (empresaId se ignora igual que en Empleados)
  const [empresaId, setEmpresaId] = useState<string | undefined>(undefined);
  const [desde, setDesde] = useState(haceDiasIso(14));
  const [hasta, setHasta] = useState(hoyIso());

  const [reporte, setReporte] = useState<ReporteHorasDto | null>(null);
  const [cargando, setCargando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (esSuperAdmin && !empresaId) {
      setError('Selecciona una empresa');
      return;
    }
    if (hasta < desde) {
      setError('"Hasta" debe ser igual o posterior a "Desde"');
      return;
    }

    setError(null);
    setCargando(true);
    try {
      const respuesta = await generarReporteHoras({ empresaId, desde, hasta });
      setReporte(respuesta);
    } catch (err) {
      setReporte(null);
      setError(esApiError(err) ? err.message : 'No se pudo generar el reporte');
    } finally {
      setCargando(false);
    }
  };

  const descargarPdf = async () => {
    setError(null);
    setDescargando(true);
    try {
      const blob = await descargarReporteHorasPdf({ empresaId, desde, hasta });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `reporte-horas-${desde}-a-${hasta}.pdf`;
      enlace.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(esApiError(err) ? err.message : 'No se pudo descargar el PDF');
    } finally {
      setDescargando(false);
    }
  };

  const columnas: ColumnaTabla<EmpleadoReporteDto>[] = [
    { clave: 'codigo', encabezado: 'Código', render: (fila) => fila.codigo, ancho: '90px' },
    { clave: 'nombre', encabezado: 'Empleado', render: (fila) => `${fila.nombre} ${fila.apellido}` },
    { clave: 'horas', encabezado: 'Horas', render: (fila) => fila.horas.toFixed(2), ancho: '80px' },
    {
      clave: 'tarifaHoraBase',
      encabezado: 'Tarifa/h',
      render: (fila) => formatoLempiras(fila.tarifaHoraBase),
      ancho: '90px',
    },
    {
      clave: 'pagoBase',
      encabezado: 'Pago base',
      render: (fila) => formatoLempiras(fila.pagoBase),
      ancho: '100px',
    },
    {
      clave: 'desglose',
      encabezado: 'Recargos',
      render: (fila) =>
        fila.desglose.length > 0 ? (
          <ul className={styles.listaDesglose}>
            {fila.desglose.map((regla) => (
              <li key={regla.reglaId}>
                {regla.nombre} (+{regla.porcentaje}%): {regla.horas.toFixed(2)}h → {formatoLempiras(regla.monto)}
              </li>
            ))}
          </ul>
        ) : (
          '—'
        ),
      ancho: '220px',
    },
    { clave: 'pago', encabezado: 'Pago total', render: (fila) => formatoLempiras(fila.pago), ancho: '110px' },
    {
      clave: 'aviso',
      encabezado: '',
      ancho: '200px',
      render: (fila) =>
        fila.turnosIncompletos > 0 ? (
          <span className={styles.avisoIncompleto}>
            {fila.turnosIncompletos} turno(s) sin marcar salida
          </span>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        titulo="Reportes de horas"
        descripcion="Horas trabajadas y pago por empleado en un rango de fechas, a partir de los marcajes del kiosco"
      />

      <Card className={styles.filtros}>
        <form className={styles.formulario} onSubmit={(evento) => void generar(evento)}>
          {esSuperAdmin && (
            <div className={styles.campo}>
              <label className={styles.etiqueta} htmlFor="empresaId">
                Empresa
              </label>
              <EmpresaSelector id="empresaId" empresaId={empresaId} onCambiar={setEmpresaId} />
            </div>
          )}

          <Input etiqueta="Desde" type="date" name="desde" value={desde} onChange={(e) => setDesde(e.target.value)} required />
          <Input etiqueta="Hasta" type="date" name="hasta" value={hasta} onChange={(e) => setHasta(e.target.value)} required />

          <div className={styles.acciones}>
            <Button type="submit" cargando={cargando}>
              Generar reporte
            </Button>
            <Button
              type="button"
              variante="secundario"
              disabled={!reporte || descargando}
              onClick={() => void descargarPdf()}
            >
              {descargando ? 'Generando PDF...' : 'Descargar PDF'}
            </Button>
          </div>
        </form>
      </Card>

      {error && <Banner tipo="error">{error}</Banner>}

      {reporte && (
        <>
          <div className={styles.resumen}>
            <Card className={styles.tarjetaResumen}>
              <span className={styles.resumenEtiqueta}>Empresa</span>
              <span className={styles.resumenValor}>{reporte.empresa.nombre}</span>
            </Card>
            <Card className={styles.tarjetaResumen}>
              <span className={styles.resumenEtiqueta}>Total horas</span>
              <span className={styles.resumenValor}>{reporte.totales.horas.toFixed(2)}</span>
            </Card>
            <Card className={styles.tarjetaResumen}>
              <span className={styles.resumenEtiqueta}>Total a pagar</span>
              <span className={styles.resumenValor}>{formatoLempiras(reporte.totales.pago)}</span>
            </Card>
          </div>

          <Table
            columnas={columnas}
            filas={reporte.empleados}
            obtenerLlave={(fila) => fila.empleadoId}
            vacio="No hay empleados activos en esta empresa"
          />
        </>
      )}
    </div>
  );
};
