import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchInput } from '../../components/common/SearchInput';
import { Table } from '../../components/common/Table';
import type { ColumnaTabla } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Banner } from '../../components/common/Banner';
import { EmpresaFormulario } from '../../components/empresas/EmpresaFormulario';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { actualizarEmpresa, crearEmpresa, listarEmpresas } from '../../api/endpoints/empresas';
import { esApiError } from '../../api/errors';
import type { CreateEmpresaDto, EmpresaDto, UpdateEmpresaDto } from '../../api/tipos';
import styles from './EmpresasPage.module.css';

const LIMITE = 10;

export const EmpresasPage = () => {
  const [busqueda, setBusqueda] = useState('');
  const busquedaDiferida = useDebouncedValue(busqueda);
  const [pagina, setPagina] = useState(1);
  const [version, setVersion] = useState(0);

  const [empresas, setEmpresas] = useState<EmpresaDto[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<EmpresaDto | undefined>(undefined);

  // Buscar reinicia siempre a la página 1 (evita quedar "varado" en una página vacía)
  useEffect(() => {
    setPagina(1);
  }, [busquedaDiferida]);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    listarEmpresas({ page: pagina, limit: LIMITE, search: busquedaDiferida || undefined })
      .then((respuesta) => {
        if (cancelado) return;
        setEmpresas(respuesta.data);
        setTotal(respuesta.meta.total);
        setTotalPaginas(respuesta.meta.totalPages);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(esApiError(err) ? err.message : 'No se pudieron cargar las empresas');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [pagina, busquedaDiferida, version]);

  const recargar = () => setVersion((actual) => actual + 1);

  const abrirCrear = () => {
    setEmpresaEditando(undefined);
    setModalAbierto(true);
  };

  const abrirEditar = (empresa: EmpresaDto) => {
    setEmpresaEditando(empresa);
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const guardar = async (dto: CreateEmpresaDto | UpdateEmpresaDto) => {
    if (empresaEditando) {
      await actualizarEmpresa(empresaEditando.id, dto as UpdateEmpresaDto);
    } else {
      await crearEmpresa(dto as CreateEmpresaDto);
    }
    setModalAbierto(false);
    recargar();
  };

  const columnas: ColumnaTabla<EmpresaDto>[] = [
    { clave: 'nombre', encabezado: 'Nombre', render: (empresa) => empresa.nombre },
    { clave: 'slug', encabezado: 'Slug', render: (empresa) => empresa.slug },
    { clave: 'rtn', encabezado: 'RTN', render: (empresa) => empresa.rtn ?? '—' },
    {
      clave: 'limite',
      encabezado: 'Límite de empleados',
      render: (empresa) => (empresa.limiteEmpleados != null ? empresa.limiteEmpleados : 'Sin límite'),
    },
    {
      clave: 'estado',
      encabezado: 'Estado',
      ancho: '110px',
      render: (empresa) => <Badge tono={empresa.activa ? 'exito' : 'peligro'}>{empresa.activa ? 'Activa' : 'Inactiva'}</Badge>,
    },
    {
      clave: 'acciones',
      encabezado: '',
      ancho: '110px',
      render: (empresa) => (
        <Button type="button" variante="secundario" onClick={() => abrirEditar(empresa)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titulo="Empresas"
        descripcion="Administra las empresas registradas en AssistIQ"
        accion={
          <Button type="button" onClick={abrirCrear}>
            Nueva empresa
          </Button>
        }
      />

      <div className={styles.filtros}>
        <SearchInput
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          onLimpiar={() => setBusqueda('')}
          placeholder="Buscar por nombre o slug..."
        />
      </div>

      {error && <Banner tipo="error">{error}</Banner>}

      <Table columnas={columnas} filas={empresas} obtenerLlave={(empresa) => empresa.id} cargando={cargando} vacio="No hay empresas registradas" />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} total={total} onCambiar={setPagina} />

      <Modal abierto={modalAbierto} titulo={empresaEditando ? 'Editar empresa' : 'Nueva empresa'} onCerrar={cerrarModal}>
        <EmpresaFormulario valorInicial={empresaEditando} onGuardar={guardar} onCancelar={cerrarModal} />
      </Modal>
    </div>
  );
};
