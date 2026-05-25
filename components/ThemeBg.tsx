'use client';
import { useMemo } from 'react';

export type HomeTheme = 'space' | 'city' | 'galaxy' | 'unicorn' | 'gaming' | 'ocean';

export const HOME_THEMES: { value: HomeTheme; label: string; emoji: string }[] = [
  { value: 'space',   label: 'Romfart',        emoji: '🚀' },
  { value: 'city',    label: 'Neon City',       emoji: '🏙️' },
  { value: 'galaxy',  label: 'Galaksekrigere',  emoji: '⚔️' },
  { value: 'unicorn', label: 'Enhjørningmagi',  emoji: '🦄' },
  { value: 'gaming',  label: 'Gaming',          emoji: '🎮' },
  { value: 'ocean',   label: 'Havdyp',          emoji: '🌊' },
];

// Deterministic pseudo-random (no hydration mismatch)
function makeRng(seed = 1) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function useParticles(count: number, seed = 42) {
  return useMemo(() => {
    const r = makeRng(seed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: r() * 100,
      y: r() * 100,
      size: r() * 3 + 0.5,
      delay: r() * 6,
      dur: r() * 4 + 2,
      opacity: r() * 0.7 + 0.2,
      hue: Math.round(r() * 360),
    }));
  }, [count, seed]);
}

// ── Space ─────────────────────────────────────────────────────────────────────
function SpaceBg() {
  const stars = useParticles(90, 1);
  const orbs = useParticles(4, 99);
  return (
    <div className="absolute inset-0 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 30% 20%, #0d0d2b 0%, #050510 60%, #000 100%)' }}>
      {/* Stars */}
      {stars.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            opacity: s.opacity,
            animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          }} />
      ))}
      {/* Planets / nebulae */}
      {orbs.map((o, i) => (
        <div key={o.id} className="absolute rounded-full pointer-events-none"
          style={{
            left: `${o.x}%`, top: `${o.y}%`,
            width: [120, 60, 200, 80][i] ?? 80,
            height: [120, 60, 200, 80][i] ?? 80,
            background: [
              'radial-gradient(circle, #4f46e5 0%, #312e81 40%, transparent 70%)',
              'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
              'radial-gradient(circle, #1e1b4b55 0%, #6366f130 40%, transparent 65%)',
              'radial-gradient(circle, #ec4899 0%, transparent 60%)',
            ][i] ?? 'transparent',
            opacity: o.opacity * 0.6,
            animation: `float-gentle ${o.dur * 3}s ${o.delay}s ease-in-out infinite`,
            filter: 'blur(2px)',
          }} />
      ))}
      {/* Milky way band */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(105deg, transparent 20%, #6366f108 40%, #818cf812 55%, transparent 70%)' }} />
    </div>
  );
}

// ── Neon City ─────────────────────────────────────────────────────────────────
function CityBg() {
  const rain = useParticles(40, 2);
  const glows = useParticles(5, 77);
  return (
    <div className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050008 0%, #0d0018 40%, #0a0020 70%, #12001a 100%)' }}>
      {/* Neon glows */}
      {glows.map((g, i) => (
        <div key={g.id} className="absolute rounded-full pointer-events-none"
          style={{
            left: `${g.x}%`, top: `${30 + g.y * 0.4}%`,
            width: 180 + g.size * 30,
            height: 80 + g.size * 20,
            background: ['#ff00ff', '#00ffff', '#ff0080', '#8000ff', '#00ff88'][i % 5],
            opacity: 0.07,
            filter: 'blur(40px)',
            animation: `neon-pulse ${g.dur + 2}s ${g.delay}s ease-in-out infinite`,
          }} />
      ))}
      {/* City skyline silhouette */}
      <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 400 160" preserveAspectRatio="xMidYMax slice" style={{ opacity: 0.6 }}>
        {/* Buildings */}
        <rect x="0"   y="80"  width="28"  height="80" fill="#0a0018" />
        <rect x="5"   y="60"  width="18"  height="20" fill="#0a0018" />
        <rect x="10"  y="50"  width="8"   height="10" fill="#120028" />
        <rect x="30"  y="40"  width="40"  height="120" fill="#080015" />
        <rect x="38"  y="30"  width="24"  height="10" fill="#080015" />
        <rect x="47"  y="20"  width="6"   height="10" fill="#0a001f" />
        <rect x="72"  y="70"  width="22"  height="90" fill="#0c001a" />
        <rect x="76"  y="55"  width="14"  height="15" fill="#0c001a" />
        <rect x="96"  y="50"  width="50"  height="110" fill="#060012" />
        <rect x="106" y="35"  width="30"  height="15" fill="#060012" />
        <rect x="116" y="25"  width="10"  height="10" fill="#08001a" />
        <rect x="148" y="65"  width="30"  height="95" fill="#0b0020" />
        <rect x="180" y="30"  width="60"  height="130" fill="#040010" />
        <rect x="190" y="15"  width="40"  height="15" fill="#040010" />
        <rect x="208" y="5"   width="4"   height="10" fill="#8b5cf660" />
        <rect x="242" y="60"  width="35"  height="100" fill="#09001e" />
        <rect x="279" y="45"  width="28"  height="115" fill="#070018" />
        <rect x="284" y="32"  width="18"  height="13" fill="#070018" />
        <rect x="309" y="70"  width="45"  height="90" fill="#0d0020" />
        <rect x="316" y="55"  width="31"  height="15" fill="#0d0020" />
        <rect x="329" y="42"  width="5"   height="13" fill="#ec4899aa" />
        <rect x="356" y="50"  width="44"  height="110" fill="#060015" />
        <rect x="362" y="35"  width="32"  height="15" fill="#060015" />
        {/* Window lights */}
        {Array.from({ length: 80 }, (_, i) => {
          const r = makeRng(i + 100);
          const x = r() * 380 + 10;
          const y = r() * 130 + 35;
          const colors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff88', '#ff6600', '#ffffff'];
          return (
            <rect key={i} x={x} y={y} width="3" height="2"
              fill={colors[Math.floor(r() * colors.length)]}
              opacity={r() * 0.6 + 0.2} />
          );
        })}
      </svg>
      {/* Rain */}
      {rain.map(p => (
        <div key={p.id} className="absolute bg-cyan-400/20 rounded-full"
          style={{
            left: `${p.x}%`,
            top: '-5%',
            width: 1,
            height: 18 + p.size * 4,
            animation: `rain-fall ${p.dur * 0.4 + 0.6}s ${p.delay * 0.4}s linear infinite`,
          }} />
      ))}
    </div>
  );
}

// ── Galaxy Warriors ────────────────────────────────────────────────────────────
function GalaxyBg() {
  const stars = useParticles(70, 3);
  const streaks = useParticles(6, 55);
  const nebulae = useParticles(3, 88);
  return (
    <div className="absolute inset-0 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 60% 40%, #1a0040 0%, #080018 50%, #020010 100%)' }}>
      {/* Nebulae */}
      {nebulae.map((n, i) => (
        <div key={n.id} className="absolute pointer-events-none"
          style={{
            left: `${n.x}%`, top: `${n.y}%`,
            width: [300, 200, 250][i],
            height: [200, 300, 180][i],
            background: [
              'radial-gradient(ellipse, #7c3aed22 0%, #4c1d9533 40%, transparent 70%)',
              'radial-gradient(ellipse, #2563eb22 0%, #1e3a8a33 40%, transparent 70%)',
              'radial-gradient(ellipse, #ec489922 0%, #9d174d33 40%, transparent 70%)',
            ][i],
            animation: `nebula-swirl ${n.dur * 6 + 15}s ${n.delay}s ease-in-out infinite`,
            filter: 'blur(1px)',
          }} />
      ))}
      {/* Stars */}
      {stars.map(s => (
        <div key={s.id} className="absolute rounded-full"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size * 0.8, height: s.size * 0.8,
            background: `hsl(${260 + s.hue * 0.2}, 80%, 85%)`,
            opacity: s.opacity,
            animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          }} />
      ))}
      {/* Light streaks / energy blades */}
      {streaks.map(s => (
        <div key={s.id} className="absolute pointer-events-none"
          style={{
            left: '-10%',
            top: `${10 + s.y * 0.8}%`,
            width: 200 + s.size * 50,
            height: s.size * 0.8 + 1,
            background: ['linear-gradient(90deg, transparent, #7c3aed, #c4b5fd, transparent)',
              'linear-gradient(90deg, transparent, #2563eb, #93c5fd, transparent)',
              'linear-gradient(90deg, transparent, #ec4899, #fbcfe8, transparent)',
              'linear-gradient(90deg, transparent, #7c3aed, transparent)',
              'linear-gradient(90deg, transparent, #06b6d4, #a5f3fc, transparent)',
              'linear-gradient(90deg, transparent, #f59e0b, #fde68a, transparent)',
            ][s.id % 6],
            opacity: 0.7,
            animation: `streak ${s.dur + 3}s ${s.delay * 1.5}s ease-in-out infinite`,
            borderRadius: 2,
          }} />
      ))}
    </div>
  );
}

// ── Unicorn Magic ─────────────────────────────────────────────────────────────
function UnicornBg() {
  const sparks = useParticles(60, 4);
  const orbs = useParticles(5, 33);
  return (
    <div className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a0030 0%, #2d0050 25%, #1a0040 50%, #300028 75%, #1a0038 100%)' }}>
      {/* Rainbow band */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(105deg, transparent 10%, #ff006610 25%, #ff99cc10 35%, #cc00ff10 50%, #6600ff10 65%, transparent 80%)', opacity: 0.8 }} />
      {/* Glowing orbs */}
      {orbs.map((o, i) => (
        <div key={o.id} className="absolute rounded-full pointer-events-none"
          style={{
            left: `${o.x}%`, top: `${o.y}%`,
            width: 100 + o.size * 30,
            height: 100 + o.size * 30,
            background: ['radial-gradient(circle, #ff66cc 0%, transparent 70%)',
              'radial-gradient(circle, #cc44ff 0%, transparent 70%)',
              'radial-gradient(circle, #ff99ee 0%, transparent 70%)',
              'radial-gradient(circle, #aa00ff 0%, transparent 70%)',
              'radial-gradient(circle, #ff44aa 0%, transparent 70%)',
            ][i % 5],
            opacity: o.opacity * 0.3,
            filter: 'blur(20px)',
            animation: `float-gentle ${o.dur * 2 + 5}s ${o.delay}s ease-in-out infinite`,
          }} />
      ))}
      {/* Sparkles */}
      {sparks.map(s => (
        <div key={s.id} className="absolute font-black"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            fontSize: s.size * 3 + 6,
            color: `hsl(${280 + (s.id % 5) * 30}, 100%, 80%)`,
            opacity: s.opacity,
            animation: `spark ${s.dur}s ${s.delay}s ease-in-out infinite`,
            lineHeight: 1,
          }}>✦</div>
      ))}
    </div>
  );
}

// ── Gaming ───────────────────────────────────────────────────────────────────
function GamingBg() {
  const particles = useParticles(30, 5);
  return (
    <div className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000d1a 0%, #001020 50%, #000510 100%)' }}>
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
      {/* Scan line */}
      <div className="absolute left-0 right-0 pointer-events-none"
        style={{ height: 2, background: 'linear-gradient(90deg, transparent, #00ff88, transparent)', opacity: 0.25, animation: 'scan-line 4s linear infinite' }} />
      {/* Neon border glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 60px rgba(0,255,136,0.05), inset 0 0 120px rgba(0,100,255,0.04)' }} />
      {/* Pixels / data particles */}
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-sm"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: Math.round(p.size) + 2,
            height: Math.round(p.size) + 2,
            background: ['#00ff88', '#0066ff', '#ff0066', '#00ccff', '#ffcc00'][p.id % 5],
            opacity: p.opacity * 0.7,
            animation: `twinkle ${p.dur}s ${p.delay}s ease-in-out infinite`,
          }} />
      ))}
      {/* Corner accents */}
      <div className="absolute top-0 left-0 pointer-events-none"
        style={{ width: 60, height: 60, borderTop: '2px solid #00ff8840', borderLeft: '2px solid #00ff8840' }} />
      <div className="absolute top-0 right-0 pointer-events-none"
        style={{ width: 60, height: 60, borderTop: '2px solid #0066ff40', borderRight: '2px solid #0066ff40' }} />
      <div className="absolute bottom-0 left-0 pointer-events-none"
        style={{ width: 60, height: 60, borderBottom: '2px solid #ff006640', borderLeft: '2px solid #ff006640' }} />
      <div className="absolute bottom-0 right-0 pointer-events-none"
        style={{ width: 60, height: 60, borderBottom: '2px solid #00ff8840', borderRight: '2px solid #00ff8840' }} />
    </div>
  );
}

// ── Ocean ─────────────────────────────────────────────────────────────────────
function OceanBg() {
  const bubbles = useParticles(35, 6);
  return (
    <div className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000a1a 0%, #000f28 30%, #001535 60%, #001a3a 100%)' }}>
      {/* Bioluminescent glow layers */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 80%, #006688 0%, transparent 60%)', opacity: 0.08 }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 50%, #004488 0%, transparent 50%)', opacity: 0.07 }} />
      {/* Light rays from surface */}
      {[10, 30, 50, 70, 90].map(x => (
        <div key={x} className="absolute top-0 pointer-events-none"
          style={{
            left: `${x}%`,
            width: 40 + x * 0.3,
            height: '70%',
            background: 'linear-gradient(180deg, #00aaff12 0%, transparent 100%)',
            transform: `skewX(${(x - 50) * 0.3}deg)`,
            filter: 'blur(8px)',
            animation: `drift ${4 + x * 0.1}s ${x * 0.05}s ease-in-out infinite`,
          }} />
      ))}
      {/* Bubbles */}
      {bubbles.map(b => (
        <div key={b.id} className="absolute rounded-full border border-cyan-400/30"
          style={{
            left: `${b.x}%`,
            bottom: '-5%',
            width: b.size * 3 + 4,
            height: b.size * 3 + 4,
            background: 'radial-gradient(circle at 30% 30%, rgba(100,220,255,0.3) 0%, rgba(0,100,200,0.1) 100%)',
            animation: `bubble-rise ${b.dur + 3}s ${b.delay}s ease-in infinite`,
          }} />
      ))}
      {/* Wave at bottom */}
      <svg className="absolute bottom-0 left-0 right-0 w-full pointer-events-none" viewBox="0 0 400 80" preserveAspectRatio="none">
        <path d="M0,40 Q50,10 100,40 Q150,70 200,40 Q250,10 300,40 Q350,70 400,40 L400,80 L0,80 Z"
          fill="#003355" opacity="0.5" style={{ animation: 'wave-bob 6s ease-in-out infinite' }} />
        <path d="M0,55 Q60,30 120,55 Q180,80 240,55 Q300,30 360,55 Q380,65 400,55 L400,80 L0,80 Z"
          fill="#002244" opacity="0.4" style={{ animation: 'wave-bob 8s 1s ease-in-out infinite' }} />
      </svg>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ThemeBg({ theme }: { theme?: string }) {
  switch (theme as HomeTheme) {
    case 'city':    return <CityBg />;
    case 'galaxy':  return <GalaxyBg />;
    case 'unicorn': return <UnicornBg />;
    case 'gaming':  return <GamingBg />;
    case 'ocean':   return <OceanBg />;
    case 'space':
    default:        return <SpaceBg />;
  }
}
