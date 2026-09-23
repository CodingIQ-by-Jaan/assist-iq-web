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
import { SecretoGenerado } from '../../components/common/SecretoGenerado';
import { EmpresaSelector } from '../../components/empresas/EmpresaSelector';
import { AdministradorFormulario } from '../../components/administradores/AdministradorFormulario';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  actualizarUsuarioAdmin,
  crearUsuarioAdmin,
  listarUsuariosAdmin,
  restablecerPasswordUsuarioAdmin,
} from '../../api/endpoints/usuarios-admin';
import { esApiError } from '../../api/errors';
import type { CreateUsuarioAdminDto, UpdateUsuarioAdminDto, UsuarioAdminDto } from '../../api/tipos';
import styles from './AdministradoresPage.module.css';

const LIMITE = 10;

export const AdministradoresPage = () => {
  const [empresaFiltro, setEmpresaFiltro] = useState<string | undefined>(undefined);
  const [busqueda, setBusqueda] = useState('');
  const busquedaDiferida = useDebouncedValue(busqueda);
  const [pagina, setPagina] = useState(1);
  const [version, setVersion] = useState(0);

  const [administradores, setAdministradores] = useState<UsuarioAdminDto[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [administradorEditando, setAdministradorEditando] = useState<UsuarioAdminDto | undefined>(undefined);
  const [passwordAMostrar, setPasswordAMostrar] = useState<string | null>(null);

  // Buscar o cambiar de empresa reinicia siempre a la página 1
  useEffect(() => {
    setPagina(1);
  }, [busquedaDiferida, empresaFiltro]);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    listarUsuariosAdmin({
      page: pagina,
      limit: LIMITE,
      search: busquedaDiferida || undefined,
      empresaId: empresaFiltro,
    })
      .then((respuesta) => {
        if (cancelado) return;
        setAdministradores(respuesta.data);
        setTotal(respuesta.meta.total);
        setTotalPaginas(respuesta.meta.totalPages);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(esApiError(err) ? err.message : 'No se pudieron cargar los administradores');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [pagina, busquedaDiferida, empresaFiltro, version]);

  const recargar = () => setVersion((actual) => actual + 1);

  const abrirCrear = () => {
    setAdministradorEditando(undefined);
    setModalAbierto(true);
  };

  const abrirEditar = (administrador: UsuarioAdminDto) => {
    setAdministradorEditando(administrador);
    setModalAbierto(true);
  };

  const cerrarModal = () => setModalAbierto(false);

  const guardar = async (dto: CreateUsuarioAdminDto | UpdateUsuarioAdminDto) => {
    if (administradorEditando) {
      await actualizarUsuarioAdmin(administradorEditando.id, dto as UpdateUsuarioAdminDto);
      setModalAbierto(false);
      recargar();
    } else {
      const { password } = await crearUsuarioAdmin(dto as CreateUsuarioAdminDto);
      setModalAbierto(false);
      recargar();
      setPasswordAMostrar(password);
    }
  };

  const alRestablecerPassword = async (administrador: UsuarioAdminDto) => {
    try {
      const respuesta = await restablecerPasswordUsuarioAdmin(administrador.id);
      setPasswordAMostrar(respuesta.password);
    } catch (err) {
      setError(esApiError(err) ? err.message : 'No se pudo restablecer la contraseña');
    }
  };

  const columnas: ColumnaTabla<UsuarioAdminDto>[] = [
    { clave: 'nombre', encabezado: 'Nombre', render: (administrador) => administrador.nombre },
    { clave: 'email', encabezado: 'Correo', render: (administrador) => administrador.email },
    {
      clave: 'estado',
      encabezado: 'Estado',
      ancho: '110px',
      render: (administrador) => (
        <Badge tono={administrador.activo ? 'exito' : 'neutro'}>
          {administrador.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      clave: 'acciones',
      encabezado: '',
      ancho: '240px',
      render: (administrador) => (
        <div className={styles.accionesFila}>
          <Button type="button" variante="secundario" onClick={() => abrirEditar(administrador)}>
            Editar
          </Button>
          <Button type="button" variante="secundario" onClick={() => void alRestablecerPassword(administrador)}>
            Restablecer contraseña
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titulo="Administradores"
        descripcion="Cuentas de acceso al panel para cada empresa"
        accion={
          <Button type="button" onClick={abrirCrear}>
            Nuevo administrador
          </Button>
        }
      />

      <div className={styles.filtros}>
        <SearchInput
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          onLimpiar={() => setBusqueda('')}
          placeholder="Buscar por nombre o correo..."
        />
        <EmpresaSelector empresaId={empresaFiltro} onCambiar={setEmpresaFiltro} incluirTodas />
      </div>

      {error && <Banner tipo="error">{error}</Banner>}

      <Table
        columnas={columnas}
        filas={administradores}
        obtenerLlave={(administrador) => administrador.id}
        cargando={cargando}
        vacio="No hay administradores registrados"
      />

      <Pagination pagina={pagina} totalPaginas={totalPaginas} total={total} onCambiar={setPagina} />

      <Modal
        abierto={modalAbierto}
        titulo={administradorEditando ? 'Editar administrador' : 'Nuevo administrador'}
        onCerrar={cerrarModal}
      >
        <AdministradorFormulario
          valorInicial={administradorEditando}
          empresaIdInicial={empresaFiltro}
          onGuardar={guardar}
          onCancelar={cerrarModal}
        />
      </Modal>

      <Modal
        abierto={passwordAMostrar !== null}
        titulo="Contraseña generada"
        onCerrar={() => setPasswordAMostrar(null)}
        ancho="angosto"
      >
        {passwordAMostrar && (
          <SecretoGenerado
            valor={passwordAMostrar}
            aviso="Esta contraseña solo se muestra una vez. Compártela con el administrador ahora."
            onCerrar={() => setPasswordAMostrar(null)}
          />
        )}
      </Modal>
    </div>
  );
};
