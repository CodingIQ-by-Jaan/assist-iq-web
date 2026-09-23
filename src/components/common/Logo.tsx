import styles from './Logo.module.css';

interface Props {
  // "completo" = ícono + wordmark; "icono" = solo la marca (para espacios chicos)
  variante?: 'completo' | 'icono';
  tamanoIcono?: number;
  className?: string;
}

const IconoAssistIQ = ({ tamano }: { tamano: number }) => (
  <svg width={tamano} height={tamano} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <linearGradient id="assistiq-rim" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#60A5FA" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="41" stroke="url(#assistiq-rim)" strokeWidth="7" />
    <line x1="50" y1="12" x2="50" y2="20" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
    <line x1="50" y1="80" x2="50" y2="88" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
    <line x1="12" y1="50" x2="20" y2="50" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
    <line x1="80" y1="50" x2="88" y2="50" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
    <path
      d="M32 52 L45 65 L71 35"
      stroke="#F97316"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Marca de AssistIQ: ícono (reloj + check, azul/naranja) con wordmark opcional.
// Un solo lugar para la marca, así queda igual en el sidebar, el login, etc.
export const Logo = ({ variante = 'completo', tamanoIcono = 32, className }: Props) => (
  <span className={[styles.logo, className].filter(Boolean).join(' ')}>
    <IconoAssistIQ tamano={tamanoIcono} />
    {variante === 'completo' && (
      <span className={styles.wordmark}>
        <span className={styles.assist}>Assist</span>
        <span className={styles.iq}>IQ</span>
      </span>
    )}
  </span>
);
