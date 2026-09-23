import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Banner } from '../../components/common/Banner';
import { Logo } from '../../components/common/Logo';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { esApiError } from '../../api/errors';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const { usuario, cargando, iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ya hay sesión activa (por ejemplo, tras un refresh silencioso): no mostrar el login
  if (!cargando && usuario) {
    const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/';
    return <Navigate to={destino} replace />;
  }

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await iniciarSesion(email, password);
      navegar('/', { replace: true });
    } catch (err) {
      setError(esApiError(err) ? err.message : 'No se pudo iniciar sesión. Intente de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.contenedor}>
      <div className={styles.alternarTema}>
        <ThemeToggle />
      </div>
      <Card className={styles.tarjeta}>
        <h1 className={styles.titulo}>
          <Logo tamanoIcono={34} />
        </h1>
        <p className={styles.subtitulo}>Panel de administración</p>

        <form className={styles.formulario} onSubmit={(e) => void enviar(e)}>
          {error && <Banner tipo="error">{error}</Banner>}

          <Input
            etiqueta="Correo"
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            etiqueta="Contraseña"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" cargando={enviando}>
            Ingresar
          </Button>
        </form>
      </Card>
    </div>
  );
};
