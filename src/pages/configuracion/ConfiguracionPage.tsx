import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Table } from '../../components/common/Table';
import type { ColumnaTabla } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Banner } from '../../components/common/Banner';
import { EmpresaSelector } from '../../components/empresas/EmpresaSelector';
import { ReglaRecargoFormulario } from '../../components/configuracion/ReglaRecargoFormulario';
import { actualizarReglaRecargo, crearReglaRecargo, listarReglasRecargo } from '../../api/endpoints/reglas-recargo';
import { esApiError } from '../../api/errors';
import type { CreateReglaRecargoDto, ReglaRecargoDto, UpdateReglaRecargoDto } from '../../api/tipos';
import styles from './ConfiguracionPage.module.css';

export const ConfiguracionPage = () => {
  const { usuario } = useAuth();
  const esSuperAdmin = usuario?.rol === 'SUPER_ADMIN';

  // ADMIN_EMPRESA no elige empresa: el backend la resuelve a la suya (igual que en Empleados y Reportes)
  const [empresaId, setEmpresaId] = useState<string | undefined>(undefined);
  const [version, setVersion] = useState(0);

  const [reglas, setReglas] = useState<ReglaRecargoDto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [reglaEditando, setReglaEditando] = useState<ReglaRecargoDto | undefined>(undefined);

  useEffect(() => {
    // El SUPER_ADMIN todavía no ha elegido empresa: no hay nada que listar
    if (esSuperAdmin && !empresaId) {
      setReglas([]);
      return;
    }

    let cancelado = false;
    setCargando(true);
    setError(null);

    listarReglasRecargo({ empresaId })
      .then((respuesta) => {
        if (!cancelado) setReglas(respuesta);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(esApiError(err) ? err.message : 'No se pudieron cargar las reglas de recargo');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [empresaId, esSuperAdmin, version]);

  const recargar = () => setVersion((actual) => actual + 1);

  const abrirCrear = () => {
    setReglaEditando(undefined);
    setModalAbierto(true);
  };

  const abrirEditar = (regla: ReglaRecargoDto) => {
    setReglaEditando(regla);
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const guardar = async (dto: CreateReglaRecargoDto | UpdateReglaRecargoDto) => {
    if (reglaEditando) {
      await actualizarReglaRecargo(reglaEditando.id, dto as UpdateReglaRecargoDto);
    } else {
      await crearReglaRecargo(dto as CreateReglaRecargoDto);
    }
    setModalAbierto(false);
    recargar();
  };

  const columnas: ColumnaTabla<ReglaRecargoDto>[] = [
    { clave: 'nombre', encabezado: 'Nombre', render: (regla) => regla.nombre },
    {
      clave: 'franja',
      encabezado: 'Franja horaria',
      ancho: '160px',
      render: (regla) => `${regla.horaInicio} – ${regla.horaFin}`,
    },
    {
      clave: 'porcentaje',
      encabezado: 'Porcentaje extra',
      ancho: '140px',
      render: (regla) => `+${regla.porcentaje}%`,
    },
    {
      clave: 'estado',
      encabezado: 'Estado',
      ancho: '110px',
      render: (regla) => <Badge tono={regla.activa ? 'exito' : 'neutro'}>{regla.activa ? 'Activa' : 'Inactiva'}</Badge>,
    },
    {
      clave: 'acciones',
      encabezado: '',
      ancho: '120px',
      render: (regla) => (
        <div className={styles.accionesFila}>
          <Button type="button" variante="secundario" onClick={() => abrirEditar(regla)}>
            Editar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titulo="Configuración"
        descripcion="Reglas de recargo por franja horaria (ej. nocturnidad) para el cálculo automático de pago"
        accion={
          (!esSuperAdmin || empresaId) && (
            <Button type="button" onClick={abrirCrear}>
              Nueva regla
            </Button>
          )
        }
      />

      {esSuperAdmin && (
        <div className={styles.filtros}>
          <EmpresaSelector empresaId={empresaId} onCambiar={setEmpresaId} />
        </div>
      )}

      {error && <Banner tipo="error">{error}</Banner>}

      {esSuperAdmin && !empresaId ? (
        <Banner tipo="info">Selecciona una empresa para ver y administrar sus reglas de recargo.</Banner>
      ) : (
        <Table
          columnas={columnas}
          filas={reglas}
          obtenerLlave={(regla) => regla.id}
          cargando={cargando}
          vacio="No hay reglas de recargo configuradas"
        />
      )}

      <Modal abierto={modalAbierto} titulo={reglaEditando ? 'Editar regla' : 'Nueva regla'} onCerrar={cerrarModal}>
        <ReglaRecargoFormulario
          valorInicial={reglaEditando}
          mostrarSelectorEmpresa={esSuperAdmin}
          empresaIdInicial={empresaId}
          onGuardar={guardar}
          onCancelar={cerrarModal}
        />
      </Modal>
    </div>
  );
};
