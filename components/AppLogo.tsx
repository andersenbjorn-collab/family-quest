'use client';

export const LOGO_PRESETS = [
  { id: 'shield',  label: 'Skjold'   },
  { id: 'crown',   label: 'Krone'    },
  { id: 'rocket',  label: 'Rakett'   },
  { id: 'star',    label: 'Stjerne'  },
  { id: 'castle',  label: 'Slott'    },
  { id: 'dragon',  label: 'Drage'    },
  { id: 'gem',     label: 'Krystall' },
  { id: 'compass', label: 'Kompass'  },
] as const;

export type LogoId = typeof LOGO_PRESETS[number]['id'];

// ── Individual SVG logos ───────────────────────────────────────────────────
function Shield() {
  return (
    <svg viewBox="0 0 100 108" fill="none" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="sh1" x1="0" y1="0" x2="80" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8"/><stop offset="1" stopColor="#5b21b6"/>
        </linearGradient>
        <linearGradient id="sh2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fde68a"/><stop offset="1" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
      {/* Shield body */}
      <path d="M50 4 L90 20 V58 Q90 86 50 104 Q10 86 10 58 V20 Z" fill="url(#sh1)"/>
      {/* Highlight rim */}
      <path d="M50 10 L84 24 V58 Q84 82 50 98" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Inner V detail */}
      <path d="M30 36 L50 56 L70 36" stroke="rgba(255,255,255,0.15)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Star */}
      <polygon points="50,28 54.5,41 69,41 57.7,49.5 62,63 50,54.5 38,63 42.3,49.5 31,41 45.5,41" fill="url(#sh2)"/>
    </svg>
  );
}

function Crown() {
  return (
    <svg viewBox="0 0 100 90" fill="none" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="cr1" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fde68a"/><stop offset="1" stopColor="#d97706"/>
        </linearGradient>
      </defs>
      {/* Crown body */}
      <path d="M8 70 L8 30 L28 52 L50 8 L72 52 L92 30 L92 70 Z" fill="url(#cr1)"/>
      {/* Base band */}
      <rect x="8" y="68" width="84" height="16" rx="4" fill="#b45309"/>
      {/* Band detail */}
      <rect x="8" y="68" width="84" height="5" rx="2" fill="#d97706" opacity="0.5"/>
      {/* Gems */}
      <circle cx="50" cy="10" r="6" fill="#f43f5e"/>
      <circle cx="50" cy="10" r="3" fill="#fda4af" opacity="0.7"/>
      <circle cx="9" cy="30" r="5" fill="#34d399"/>
      <circle cx="9" cy="30" r="2.5" fill="#a7f3d0" opacity="0.7"/>
      <circle cx="91" cy="30" r="5" fill="#60a5fa"/>
      <circle cx="91" cy="30" r="2.5" fill="#bfdbfe" opacity="0.7"/>
      {/* Diamonds in band */}
      <polygon points="30,76 34,71 38,76 34,81" fill="#fde68a" opacity="0.7"/>
      <polygon points="48,76 52,71 56,76 52,81" fill="#fde68a" opacity="0.7"/>
      <polygon points="66,76 70,71 74,76 70,81" fill="#fde68a" opacity="0.7"/>
    </svg>
  );
}

function Rocket() {
  return (
    <svg viewBox="0 0 100 110" fill="none" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="rk1" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#c4b5fd"/><stop offset="1" stopColor="#7c3aed"/>
        </linearGradient>
        <linearGradient id="rk2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fde68a"/><stop offset="0.5" stopColor="#f97316"/><stop offset="1" stopColor="#ef4444" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Flame */}
      <ellipse cx="50" cy="98" rx="14" ry="18" fill="url(#rk2)"/>
      <ellipse cx="44" cy="100" rx="6" ry="10" fill="#fbbf24" opacity="0.6"/>
      <ellipse cx="56" cy="100" rx="6" ry="10" fill="#fbbf24" opacity="0.6"/>
      {/* Body */}
      <path d="M35 75 Q32 50 50 12 Q68 50 65 75 Z" fill="url(#rk1)"/>
      {/* Nose cone highlight */}
      <path d="M50 14 Q44 35 43 55" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Window */}
      <circle cx="50" cy="55" r="9" fill="#0ea5e9" opacity="0.9"/>
      <circle cx="50" cy="55" r="6" fill="#38bdf8"/>
      <circle cx="47" cy="52" r="2.5" fill="white" opacity="0.6"/>
      {/* Wings */}
      <path d="M35 75 L18 90 L30 80 Z" fill="#6d28d9"/>
      <path d="M65 75 L82 90 L70 80 Z" fill="#6d28d9"/>
      {/* Wing highlights */}
      <path d="M35 75 L18 90" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none"/>
      <path d="M65 75 L82 90" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none"/>
    </svg>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-lg">
      <defs>
        <radialGradient id="st1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a"/>
          <stop offset="50%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#b45309"/>
        </radialGradient>
        <radialGradient id="st2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#fef9c3" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Outer glow */}
      <circle cx="50" cy="50" r="46" fill="url(#st2)"/>
      {/* 8-point star */}
      <polygon points="
        50,6  56,38  86,30  64,50
        86,70  56,62  50,94  44,62
        14,70  36,50  14,30  44,38"
        fill="url(#st1)"/>
      {/* Inner star */}
      <polygon points="
        50,24  53.5,41  68,38  57,50
        68,62  53.5,59  50,76  46.5,59
        32,62  43,50  32,38  46.5,41"
        fill="#fef08a" opacity="0.5"/>
      {/* Center shine */}
      <circle cx="50" cy="50" r="8" fill="white" opacity="0.4"/>
      <circle cx="45" cy="44" r="4" fill="white" opacity="0.3"/>
    </svg>
  );
}

function Castle() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="ca1" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#818cf8"/><stop offset="1" stopColor="#4c1d95"/>
        </linearGradient>
      </defs>
      {/* Main wall */}
      <rect x="15" y="50" width="70" height="45" rx="2" fill="url(#ca1)"/>
      {/* Left tower */}
      <rect x="12" y="38" width="22" height="57" rx="2" fill="#5b21b6"/>
      {/* Right tower */}
      <rect x="66" y="38" width="22" height="57" rx="2" fill="#5b21b6"/>
      {/* Center tower */}
      <rect x="35" y="28" width="30" height="67" rx="2" fill="#6d28d9"/>
      {/* Battlements — left tower */}
      <rect x="12" y="30" width="5" height="10" fill="#5b21b6"/>
      <rect x="21" y="30" width="5" height="10" fill="#5b21b6"/>
      <rect x="30" y="30" width="4" height="10" fill="#5b21b6"/>
      {/* Battlements — center */}
      <rect x="35" y="18" width="6" height="12" fill="#6d28d9"/>
      <rect x="45" y="18" width="6" height="12" fill="#6d28d9"/>
      <rect x="55" y="18" width="6" height="12" fill="#6d28d9"/>
      {/* Battlements — right tower */}
      <rect x="66" y="30" width="5" height="10" fill="#5b21b6"/>
      <rect x="75" y="30" width="5" height="10" fill="#5b21b6"/>
      <rect x="84" y="30" width="4" height="10" fill="#5b21b6"/>
      {/* Flag */}
      <line x1="50" y1="6" x2="50" y2="20" stroke="#fde68a" strokeWidth="2"/>
      <polygon points="50,6 64,11 50,16" fill="#ef4444"/>
      {/* Gate */}
      <path d="M42 95 L42 72 Q42 62 50 62 Q58 62 58 72 L58 95 Z" fill="#1e1b4b"/>
      {/* Windows */}
      <rect x="18" y="46" width="8" height="10" rx="4" fill="#fbbf24" opacity="0.7"/>
      <rect x="74" y="46" width="8" height="10" rx="4" fill="#fbbf24" opacity="0.7"/>
      {/* Wall highlight */}
      <rect x="15" y="50" width="70" height="3" fill="rgba(255,255,255,0.1)" rx="1"/>
    </svg>
  );
}

function Dragon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="dr1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399"/><stop offset="1" stopColor="#065f46"/>
        </linearGradient>
        <linearGradient id="dr2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fde68a"/><stop offset="1" stopColor="#f97316"/>
        </linearGradient>
      </defs>
      {/* Body */}
      <ellipse cx="45" cy="62" rx="26" ry="20" fill="url(#dr1)"/>
      {/* Tail */}
      <path d="M70 70 Q90 75 95 60 Q100 45 88 40" stroke="#065f46" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M88 40 L96 35 L85 36 L90 28" fill="#065f46"/>
      {/* Wing */}
      <path d="M38 52 Q20 30 10 20 Q22 38 28 48" fill="#065f46" opacity="0.8"/>
      <path d="M38 52 Q30 28 35 12 Q32 30 34 46" fill="#065f46" opacity="0.6"/>
      {/* Neck */}
      <ellipse cx="52" cy="42" rx="14" ry="16" fill="url(#dr1)"/>
      {/* Head */}
      <ellipse cx="60" cy="26" rx="18" ry="14" fill="url(#dr1)"/>
      {/* Snout */}
      <ellipse cx="74" cy="30" rx="10" ry="7" fill="#059669"/>
      {/* Nostril */}
      <circle cx="78" cy="30" r="2.5" fill="#064e3b"/>
      <circle cx="72" cy="32" r="2" fill="#064e3b"/>
      {/* Eye */}
      <circle cx="63" cy="20" r="6" fill="#fbbf24"/>
      <circle cx="64" cy="19" r="3.5" fill="#1c1917"/>
      <circle cx="65" cy="18" r="1.2" fill="white"/>
      {/* Horns */}
      <path d="M56 14 L52 4 L58 12" fill="#065f46"/>
      <path d="M64 12 L66 2 L70 10" fill="#065f46"/>
      {/* Fire breath */}
      <path d="M84 30 Q92 28 98 22 Q94 32 98 38 Q92 34 84 34" fill="url(#dr2)" opacity="0.9"/>
      {/* Belly scales */}
      <ellipse cx="44" cy="68" rx="18" ry="12" fill="#6ee7b7" opacity="0.4"/>
    </svg>
  );
}

function Gem() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="gm1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67e8f9"/><stop offset="0.5" stopColor="#818cf8"/><stop offset="1" stopColor="#c084fc"/>
        </linearGradient>
        <linearGradient id="gm2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="white" stopOpacity="0.5"/><stop offset="1" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Main gem shape — diamond/brilliant cut */}
      <polygon points="50,5 82,30 82,70 50,95 18,70 18,30" fill="url(#gm1)"/>
      {/* Top facets */}
      <polygon points="50,5 82,30 50,40 18,30" fill="rgba(255,255,255,0.2)"/>
      <polygon points="50,5 66,18 50,40 34,18" fill="rgba(255,255,255,0.3)"/>
      {/* Side facets */}
      <polygon points="18,30 50,40 18,70" fill="rgba(0,0,0,0.15)"/>
      <polygon points="82,30 50,40 82,70" fill="rgba(0,0,0,0.1)"/>
      {/* Bottom facet */}
      <polygon points="18,70 50,40 82,70 50,95" fill="rgba(0,0,0,0.12)"/>
      {/* Center vertical divider */}
      <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      {/* Shine */}
      <polygon points="50,5 66,18 50,40 34,18" fill="url(#gm2)"/>
      <ellipse cx="38" cy="25" rx="8" ry="5" fill="white" opacity="0.25" transform="rotate(-20 38 25)"/>
    </svg>
  );
}

function Compass() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-lg">
      <defs>
        <radialGradient id="cp1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#292524"/><stop offset="100%" stopColor="#1c1917"/>
        </radialGradient>
        <linearGradient id="cp2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fef08a"/><stop offset="1" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="50" cy="50" r="46" fill="url(#cp2)"/>
      <circle cx="50" cy="50" r="40" fill="url(#cp1)"/>
      {/* Degree marks */}
      {Array.from({ length: 36 }, (_, i) => {
        const angle = (i * 10 * Math.PI) / 180;
        const r1 = i % 9 === 0 ? 30 : i % 3 === 0 ? 33 : 35;
        const r2 = 38;
        const x1 = 50 + Math.sin(angle) * r1;
        const y1 = 50 - Math.cos(angle) * r1;
        const x2 = 50 + Math.sin(angle) * r2;
        const y2 = 50 - Math.cos(angle) * r2;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.25)" strokeWidth={i % 9 === 0 ? 1.5 : 0.5}/>;
      })}
      {/* N/S/E/W labels */}
      <text x="50" y="20" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">N</text>
      <text x="50" y="86" textAnchor="middle" fill="white" fontSize="9">S</text>
      <text x="86" y="54" textAnchor="middle" fill="white" fontSize="9">E</text>
      <text x="14" y="54" textAnchor="middle" fill="white" fontSize="9">V</text>
      {/* Needle — red/gold */}
      <polygon points="50,18 53,50 50,56 47,50" fill="#ef4444"/>
      <polygon points="50,56 53,50 50,82 47,50" fill="white" opacity="0.8"/>
      {/* Center cap */}
      <circle cx="50" cy="50" r="5" fill="#fbbf24"/>
      <circle cx="50" cy="50" r="2.5" fill="#78716c"/>
    </svg>
  );
}

// ── Renderer ──────────────────────────────────────────────────────────────
const LOGO_MAP: Record<LogoId, React.ReactNode> = {
  shield:  <Shield />,
  crown:   <Crown />,
  rocket:  <Rocket />,
  star:    <Star />,
  castle:  <Castle />,
  dragon:  <Dragon />,
  gem:     <Gem />,
  compass: <Compass />,
};

interface AppLogoProps {
  logo?: string;   // preset ID or custom image data URL / URL
  size?: number;   // px, default 80
}

export default function AppLogo({ logo = 'shield', size = 80 }: AppLogoProps) {
  const isCustom = logo.startsWith('data:') || logo.startsWith('http') || logo.startsWith('blob:');

  if (isCustom) {
    return (
      <img
        src={logo}
        alt="logo"
        style={{ width: size, height: size }}
        className="rounded-3xl object-cover"
      />
    );
  }

  const preset = (LOGO_MAP[logo as LogoId] ?? LOGO_MAP.shield);
  return (
    <div style={{ width: size, height: size }}>
      {preset}
    </div>
  );
}
