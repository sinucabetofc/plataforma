/**
 * Ícone de Sinuca - Bolas com Tacos Cruzados
 * Estilo adaptável para navbar (usa currentColor)
 */
export default function SinucaIcon({ size = 24, className = "", active = false, darkMode = false }) {
  // darkMode = true: ícone preto (para fundo verde)
  // active = true: verde neon com fundo escuro
  // padrão: cinza
  const iconColor = darkMode ? '#000000' : (active ? '#39FF14' : '#9CA3AF');
  const bgColor = active ? '#1A2C2B' : 'transparent';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {active && <rect x="0" y="0" width="60" height="60" rx="10" fill={bgColor}/>}
      <line x1="15" y1="15" x2="45" y2="45" stroke={iconColor} strokeWidth="3" strokeLinecap="round"/>
      <line x1="45" y1="15" x2="15" y2="45" stroke={iconColor} strokeWidth="3" strokeLinecap="round"/>
      <circle cx="30" cy="20" r="5" fill={iconColor}/>
      <circle cx="20" cy="30" r="5" fill={iconColor}/>
      <circle cx="40" cy="30" r="5" fill={iconColor}/>
      <circle cx="25" cy="40" r="5" fill={iconColor}/>
      <circle cx="35" cy="40" r="5" fill={iconColor}/>
    </svg>
  );
}

