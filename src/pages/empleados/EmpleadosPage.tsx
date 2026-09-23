import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { Table } from '../../components/common/Table';
import type { ColumnaTabla } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Banner } from '../../components/common/Banner';
import { EmpresaSelector } from '../../components/empresas/EmpresaSelector';
import { EmpleadoFormulario } from '../../components/empleados/EmpleadoFormulario';
import { SecretoGenerado } from '../../components/common/SecretoGenerado';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { actualizarEmpleado, crearEmpleado, listarEmpleados, restablecerPin } from '../../api/endpoints/empleados';
import { esApiError } from '../../api/errors';
import type { CreateEmpleadoDto, EmpleadoDto, UpdateEmpleadoDto } from '../../api/tipos';
import styles from './EmpleadosPage.module.css';

const LIMITE = 10;

export const EmpleadosPage = () => {
  const { usuario } = useAuth();
  const esSuperAdmin = usuario?.rol === 'SUPER_ADMIN';

  const [empresaFiltro, setEmpresaFiltro] = useState<string | undefined>(undefined);
  const [busqueda, setBusqueda] = useState('');
  const busquedaDiferida = useDebouncedValue(busqueda);
  const [pagina, setPagina] = useState(1);
  const [version, setVersion] = useState(0);

  const [empleados, setEmpleados] = useState<EmpleadoDto[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState<EmpleadoDto | undefined>(undefined);
  const [pinAMostrar, setPinAMostrar] = useState<string | null>(null);

  // Buscar o cambiar de empresa reinicia siempre a la página 1
  useEffect(() => {
    setPagina(1);
  }, [busquedaDiferida, empresaFiltro]);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    listarEmpleados({
      page: pagina,
      limit: LIMITE,
      search: busquedaDiferida || undefined,
      empresaId: esSuperAdmin ? empresaFiltro : undefined,
    })
      .then((respuesta) => {
        if (cancelado) return;
        setEmpleados(respuesta.data);
        setTotal(respuesta.meta.total);
        setTotalPaginas(respuesta.meta.totalPages);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(esApiError(err) ? err.message : 'No se pudieron cargar los empleados');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [pagina, busquedaDiferida, empresaFiltro, esSuperAdmin, version]);

  const recargar = () => setVersion((actual) => actual + 1);

  const abrirCrear = () => {
    setEmpleadoEditando(undefined);
    setModalAbierto(true);
  };

  const abrirEditar = (empleado: EmpleadoDto) => {
    setEmpleadoEditando(empleado);
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const guardar = async (dto: CreateEmpleadoDto | UpdateEmpleadoDto) => {
    if (empleadoEditando) {
      await actualizarEmpleado(empleadoEditando.id, dto as UpdateEmpleadoDto);
      setModalAbierto(false);
      recargar();
    } else {
      const { pin } = await crearEmpleado(dto as CreateEmpleadoDto);
      setModalAbierto(false);
      recargar();
      setPinAMostrar(pin);
    }
  };

  const alRestablecerPin = async (empleado: EmpleadoDto) => {
    try {
      const respuesta = await restablecerPin(empleado.id);
      setPinAMostrar(respuesta.pin);
    } catch (err) {
      setError(esApiError(err) ? err.message : 'No se pudo restablecer el PIN');
    }
  };

  const columnas: ColumnaTabla<EmpleadoDto>[] = [
    { clave: 'codigo', encabezado: 'Código', render: (empleado) => empleado.codigo, ancho: '100px' },
    { clave: 'nombre', encabezado: 'Nombre', render: (empleado) => `${empleado.nombre} ${empleado.apellido}` },
    { clave: 'identidad', encabezado: 'Identidad', render: (empleado) => empleado.identidad ?? '—' },
    { clave: 'cargo', encabezado: 'Cargo', render: (empleado) => empleado.cargo ?? '—' },
    {
      clave: 'estado',
      encabezado: 'Estado',
      ancho: '130px',
      render: (empleado) => {
        const bloqueadoHasta = empleado.bloqueadoHasta ? new Date(empleado.bloqueadoHasta) : null;
        const bloqueado = bloqueadoHasta !== null && bloqueadoHasta > new Date();
        if (bloqueado) return <Badge tono="peligro">Bloqueado</Badge>;
        return <Badge tono={empleado.activo ? 'exito' : 'neutro'}>{empleado.activo ? 'Activo' : 'Inactivo'}</Badge>;
      },
    },
    {
      clave: 'acciones',
      encabezado: '',
      ancho: '220px',
      render: (empleado) => (
        <div className={styles.accionesFila}>
          <Button type="button" variante="secundario" onClick={() => abrirEditar(empleado)}>
            Editar
          </Button>
          <Button type="button" variante="secundario" onClick={() => void alRestablecerPin(empleado)}>
            Restablecer PIN
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titulo="Empleados"
        descripcion="Administra los empleados y sus códigos de marcaje"
        accion={
          <Button type="button" onClick={abrirCrear}>
            Nuevo empleado
          </Button>
        }
      />

      <div className={styles.filtros}>
        <SearchInput
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          onLimpiar={() => setBusqueda('')}
          placeholder="Buscar por nombre, código o identidad..."
        />
        {esSuperAdmin && <EmpresaSelector empresaId={empresaFiltro} onCambiar={setEmpresaFiltro} incluirTodas />}
      </div>

      {error && <Banner tipo="error">{error}</Banner>}

      <Table
        columnas={columnas}
        filas={empleados}
        obtenerLlave={(empleado) => empleado.id}
        cargando={cargando}
        vacio="No hay empleados registrados"
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} total={total} onCambiar={setPagina} />

      <Modal abierto={modalAbierto} titulo={empleadoEditando ? 'Editar empleado' : 'Nuevo empleado'} onCerrar={cerrarModal}>
        <EmpleadoFormulario
          valorInicial={empleadoEditando}
          mostrarSelectorEmpresa={esSuperAdmin}
          empresaIdInicial={empresaFiltro}
          onGuardar={guardar}
          onCancelar={cerrarModal}
        />
      </Modal>

      <Modal abierto={pinAMostrar !== null} titulo="PIN generado" onCerrar={() => setPinAMostrar(null)} ancho="angosto">
        {pinAMostrar && (
          <SecretoGenerado
            valor={pinAMostrar}
            aviso="Este PIN solo se muestra una vez. Compártelo con el empleado ahora."
            onCerrar={() => setPinAMostrar(null)}
          />
        )}
      </Modal>
    </div>
  );
};
